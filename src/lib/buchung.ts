import { randomBytes } from "node:crypto";
import { query, tx } from "./db";
import { belegtePlaetze, buchbar, HALTEN_MIN, pruefeEingabe, type Eingabe } from "./plaetze";
import { checkoutErstellen, checkoutLesen, rueckerstatten, stripeAktiv } from "./stripe";
import { sendeMail } from "./mail";
import { ics } from "./ics";
import { appUrl, ORT_ZEILE, SITE } from "./site";
import { chf, datumLang, zeitspanne } from "./zeit";

export type Buchung = {
  id: number; session_id: number; token: string; name: string; email: string; phone: string; message: string;
  seats: number; amount_cents: number; status: "pending" | "paid" | "reserved" | "expired" | "cancelled";
  expires_at: Date | null; stripe_session_id: string | null; stripe_payment_intent: string | null;
  paid_at: Date | null; cancelled_at: Date | null; refunded_at: Date | null;
  confirmation_sent_at: Date | null; reminder_sent_at: Date | null; created_at: Date;
};

export type BuchungMitTermin = Buchung & {
  starts_at: Date; ends_at: Date; session_cancelled_at: Date | null; course_title: string; course_includes: string;
};

const MIT_TERMIN = `
  SELECT b.*, s.starts_at, s.ends_at, s.cancelled_at AS session_cancelled_at, c.title AS course_title, c.includes AS course_includes
  FROM bookings b JOIN sessions s ON s.id = b.session_id JOIN courses c ON c.id = s.course_id`;

export async function buchungNachToken(token: string): Promise<BuchungMitTermin | null> {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token)) return null;
  return (await query<BuchungMitTermin>(`${MIT_TERMIN} WHERE b.token = $1`, [token]))[0] ?? null;
}

export async function buchungenVonTermin(sessionId: number): Promise<Buchung[]> {
  return query<Buchung>("SELECT * FROM bookings WHERE session_id = $1 ORDER BY created_at", [sessionId]);
}

export type Ergebnis = { ok: true; weiter: string } | { ok: false; fehler: string };

/**
 * Legt eine Buchung an. Sperrt dazu den Termin, damit zwei gleichzeitige
 * Buchungen nicht mehr Plätze belegen als vorhanden.
 */
export async function buchen(sessionId: number, e: Eingabe): Promise<Ergebnis> {
  const token = randomBytes(18).toString("base64url");
  const online = stripeAktiv();
  const jetzt = new Date();
  const ablauf = new Date(jetzt.getTime() + HALTEN_MIN * 60_000);

  const angelegt = await tx(async (c) => {
    const s = (await c.query(
      `SELECT s.*, c.title FROM sessions s JOIN courses c ON c.id = s.course_id WHERE s.id = $1 FOR UPDATE OF s`, [sessionId],
    )).rows[0];
    if (!s) return { fehler: "Diesen Termin gibt es nicht." } as const;
    if (!buchbar(s.starts_at, s.cancelled_at, jetzt)) return { fehler: "Dieser Termin kann nicht mehr gebucht werden." } as const;
    const belegung = (await c.query("SELECT status, seats, expires_at FROM bookings WHERE session_id = $1", [sessionId])).rows;
    const frei = s.capacity - belegtePlaetze(belegung, jetzt);
    const fehler = pruefeEingabe(e, frei);
    if (fehler) return { fehler } as const;
    const betrag = s.price_cents * e.seats;
    await c.query(
      `INSERT INTO bookings (session_id, token, name, email, phone, message, seats, amount_cents, status, expires_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [sessionId, token, e.name.trim(), e.email.trim().toLowerCase(), e.phone.trim(), e.message.trim(), e.seats, betrag,
        online && betrag > 0 ? "pending" : "reserved", online && betrag > 0 ? ablauf : null],
    );
    return { s, betrag } as const;
  });
  if ("fehler" in angelegt) return { ok: false, fehler: angelegt.fehler as string };

  const { s, betrag } = angelegt;
  if (!online || betrag === 0) {
    await bestaetigen(token);
    return { ok: true, weiter: `/buchung/${token}` };
  }

  try {
    const cs = await checkoutErstellen({
      token,
      bezeichnung: `${s.title}, ${datumLang(s.starts_at)}`,
      stueckpreisCents: s.price_cents,
      anzahl: e.seats,
      email: e.email.trim(),
      erfolgUrl: `${appUrl()}/buchung/${token}?bezahlt=1`,
      abbruchUrl: `${appUrl()}/buchung/${token}?abgebrochen=1`,
      ablauf,
    });
    await query("UPDATE bookings SET stripe_session_id = $1 WHERE token = $2", [cs.id, token]);
    if (!cs.url) throw new Error("Stripe gab keine Adresse zurück");
    return { ok: true, weiter: cs.url };
  } catch (err) {
    console.error("[argi] Stripe Checkout fehlgeschlagen:", err);
    await query("UPDATE bookings SET status = 'expired' WHERE token = $1 AND status = 'pending'", [token]);
    return { ok: false, fehler: "Die Zahlung konnte gerade nicht gestartet werden. Bitte versuch es in ein paar Minuten nochmals." };
  }
}

/** Zahlung bestätigt (Webhook oder Rückkehr von Stripe). Idempotent. */
export async function alsBezahltMarkieren(token: string, paymentIntent: string | null): Promise<void> {
  const r = await query(
    `UPDATE bookings SET status = 'paid', paid_at = now(), stripe_payment_intent = COALESCE($2, stripe_payment_intent)
     WHERE token = $1 AND status IN ('pending','expired') RETURNING id`, [token, paymentIntent],
  );
  if (r.length) await bestaetigen(token);
}

export async function alsAbgelaufenMarkieren(stripeSessionId: string): Promise<void> {
  await query("UPDATE bookings SET status = 'expired' WHERE stripe_session_id = $1 AND status = 'pending'", [stripeSessionId]);
}

/** Fragt bei Stripe nach, falls der Webhook noch nicht da ist. */
export async function zahlungNachfragen(b: BuchungMitTermin): Promise<void> {
  if (b.status !== "pending" || !b.stripe_session_id || !stripeAktiv()) return;
  try {
    const cs = await checkoutLesen(b.stripe_session_id);
    if (cs.payment_status === "paid") await alsBezahltMarkieren(b.token, cs.payment_intent);
    else if (cs.status === "expired") await alsAbgelaufenMarkieren(cs.id);
  } catch (e) {
    console.error("[argi] Stripe-Nachfrage fehlgeschlagen:", e);
  }
}

function kalender(b: BuchungMitTermin): string {
  return ics({
    uid: `buchung-${b.token}@argi`,
    start: b.starts_at,
    end: b.ends_at,
    title: `Töpferkurs: ${b.course_title}`,
    location: ORT_ZEILE,
    description: `${b.seats} Platz/Plätze. Deine Buchung: ${appUrl()}/buchung/${b.token}`,
    url: `${appUrl()}/buchung/${b.token}`,
  });
}

/** Schickt Bestätigung an die Kundin und Meldung an Argi (nur einmal). */
async function bestaetigen(token: string): Promise<void> {
  const b = await buchungNachToken(token);
  if (!b || b.confirmation_sent_at) return;
  const zahlung = b.status === "paid"
    ? `Bezahlt: ${chf(b.amount_cents)}.`
    : b.amount_cents > 0 ? `Zu bezahlen vor Ort: ${chf(b.amount_cents)} (TWINT oder bar).` : "";
  const text = [
    `Hoi ${b.name.split(" ")[0]}`,
    "",
    `schön, dass du dabei bist! Hier deine Buchung:`,
    "",
    `${b.course_title}`,
    `${datumLang(b.starts_at)}, ${zeitspanne(b.starts_at, b.ends_at)} Uhr`,
    `${b.seats} Platz/Plätze`,
    zahlung,
    "",
    `Ort: ${ORT_ZEILE}`,
    `Karte: ${SITE.ort.karte}`,
    b.course_includes ? `\nInbegriffen: ${b.course_includes}` : "",
    "",
    "Zieh etwas an, das schmutzig werden darf. Deine Stücke werden nach dem Kurs gebrannt und glasiert; ich melde mich, sobald du sie abholen kannst.",
    "",
    `Umbuchen oder absagen: Antworte einfach auf diese Mail (bis ${SITE.stornoTage} Tage vorher kostenlos).`,
    `Deine Buchung online: ${appUrl()}/buchung/${b.token}`,
    "",
    "Bis bald",
    "Argi",
  ].join("\n");
  const ok = await sendeMail({
    an: b.email,
    betreff: `Gebucht: ${b.course_title} am ${datumLang(b.starts_at)}`,
    text,
    anhaenge: [{ filename: "toepferkurs.ics", content: kalender(b), contentType: "text/calendar; charset=utf-8; method=PUBLISH" }],
  });
  if (ok) await query("UPDATE bookings SET confirmation_sent_at = now() WHERE id = $1", [b.id]);

  if (process.env.ADMIN_EMAIL) {
    await sendeMail({
      an: process.env.ADMIN_EMAIL,
      antwortAn: b.email,
      betreff: `Neue Buchung: ${b.course_title}, ${datumLang(b.starts_at)} (${b.seats})`,
      text: [
        `${b.name} <${b.email}>${b.phone ? `, ${b.phone}` : ""}`,
        `${b.seats} Platz/Plätze, ${chf(b.amount_cents)}, ${b.status === "paid" ? "bezahlt" : "zahlt vor Ort"}`,
        b.message ? `\nNachricht:\n${b.message}` : "",
        `\nTermin in der Verwaltung: ${appUrl()}/admin/termine/${b.session_id}`,
      ].join("\n"),
    });
  }
}

/** Storniert eine Buchung (Verwaltung). Bezahltes Geld geht über Stripe zurück. */
export async function stornieren(bookingId: number, rueckzahlen: boolean, grund: string): Promise<string | null> {
  const b = (await query<BuchungMitTermin>(`${MIT_TERMIN} WHERE b.id = $1`, [bookingId]))[0];
  if (!b) return "Buchung nicht gefunden.";
  if (b.status === "cancelled") return null;
  let erstattet = false;
  if (rueckzahlen && b.status === "paid" && b.stripe_payment_intent && stripeAktiv()) {
    try {
      await rueckerstatten(b.stripe_payment_intent, b.token);
      erstattet = true;
    } catch (e) {
      console.error("[argi] Rückerstattung fehlgeschlagen:", e);
      return "Die Rückerstattung bei Stripe ist fehlgeschlagen; die Buchung ist unverändert.";
    }
  }
  const war = b.status;
  await query(`UPDATE bookings SET status = 'cancelled', cancelled_at = now(), refunded_at = CASE WHEN $2 THEN now() END WHERE id = $1`, [b.id, erstattet]);
  if (war === "paid" || war === "reserved") {
    await sendeMail({
      an: b.email,
      betreff: `Abgesagt: ${b.course_title} am ${datumLang(b.starts_at)}`,
      text: [
        `Hoi ${b.name.split(" ")[0]}`,
        "",
        `deine Buchung für «${b.course_title}» am ${datumLang(b.starts_at)} ist storniert.`,
        grund ? `\n${grund}\n` : "",
        erstattet ? `Den Betrag von ${chf(b.amount_cents)} habe ich zurückerstattet; je nach Bank dauert es ein paar Tage, bis er sichtbar ist.` : "",
        "",
        `Neue Termine: ${appUrl()}/#kurse`,
        "",
        "Liebe Grüsse",
        "Argi",
      ].join("\n"),
    });
  }
  return null;
}

/** Sagt einen ganzen Termin ab: alle Buchungen storniert, Geld zurück. */
export async function terminAbsagen(sessionId: number, grund: string): Promise<string[]> {
  await query("UPDATE sessions SET cancelled_at = now() WHERE id = $1 AND cancelled_at IS NULL", [sessionId]);
  const fehler: string[] = [];
  for (const b of await buchungenVonTermin(sessionId)) {
    if (b.status === "cancelled" || b.status === "expired") continue;
    const f = await stornieren(b.id, true, grund);
    if (f) fehler.push(`${b.name}: ${f}`);
  }
  return fehler;
}

/** Erinnerung zwei Tage vor dem Kurs. Läuft im Minutentakt (start.ts). */
export async function erinnerungenSchicken(): Promise<void> {
  const faellig = await query<BuchungMitTermin>(
    `${MIT_TERMIN} WHERE b.status IN ('paid','reserved') AND b.reminder_sent_at IS NULL AND s.cancelled_at IS NULL
       AND s.starts_at > now() AND s.starts_at < now() + interval '48 hours'
       AND b.created_at < s.starts_at - interval '48 hours'`,
  );
  for (const b of faellig) {
    const ok = await sendeMail({
      an: b.email,
      betreff: `Bald ist es so weit: ${b.course_title}`,
      text: [
        `Hoi ${b.name.split(" ")[0]}`,
        "",
        `kleine Erinnerung: ${datumLang(b.starts_at)}, ${zeitspanne(b.starts_at, b.ends_at)} Uhr.`,
        `Ort: ${ORT_ZEILE}`,
        b.status === "reserved" && b.amount_cents > 0 ? `Bitte bring ${chf(b.amount_cents)} mit (TWINT oder bar).` : "",
        "",
        "Ich freu mich auf dich!",
        "Argi",
      ].join("\n"),
    });
    if (ok) await query("UPDATE bookings SET reminder_sent_at = now() WHERE id = $1", [b.id]);
  }
  // Offene Zahlungen, deren Haltezeit vorbei ist, freigeben.
  await query("UPDATE bookings SET status = 'expired' WHERE status = 'pending' AND expires_at < now() - interval '10 minutes'");
}
