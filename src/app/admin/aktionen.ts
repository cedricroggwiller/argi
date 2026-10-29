"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { COOKIE, DAUER_SEK, cookieWert, fehlversuch, gesperrt, passwortRichtig } from "@/lib/auth";
import { pflichtAdmin } from "@/lib/admin";
import { query } from "@/lib/db";
import { kursNachId, slugify } from "@/lib/kurse";
import { stornieren, terminAbsagen } from "@/lib/buchung";
import { zurichToDate } from "@/lib/zeit";

async function ip(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unbekannt";
}

export async function anmelden(fd: FormData) {
  const adr = await ip();
  if (gesperrt(adr)) redirect("/admin/login?fehler=gesperrt");
  if (!passwortRichtig(String(fd.get("passwort") ?? ""))) {
    fehlversuch(adr);
    await new Promise((r) => setTimeout(r, 600));
    redirect("/admin/login?fehler=1");
  }
  (await cookies()).set(COOKIE, cookieWert(), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: DAUER_SEK,
    secure: (process.env.APP_URL ?? "").startsWith("https://"),
  });
  redirect("/admin");
}

export async function abmelden() {
  (await cookies()).delete(COOKIE);
  redirect("/admin/login");
}

/** Franken-Eingabe ("95", "92.50", "92,5") → Rappen, sonst null. */
function rappen(s: string): number | null {
  const t = s.trim().replace(",", ".");
  if (!/^\d{1,5}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}

function ganz(s: string, min: number, max: number): number | null {
  const n = Number(s);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

const BILDER = ["/bilder/drehscheibe.jpg", "/bilder/becher-gestapelt.jpg", "/bilder/vase-kobalt.jpg", "/bilder/becher-hand.jpg", "/bilder/tasse-lavendel.jpg"];

export async function kursSpeichern(fd: FormData) {
  await pflichtAdmin();
  const id = fd.get("id") ? Number(fd.get("id")) : null;
  const title = String(fd.get("title") ?? "").trim();
  const preis = rappen(String(fd.get("preis") ?? ""));
  const plaetze = ganz(String(fd.get("plaetze") ?? ""), 1, 40);
  const dauer = ganz(String(fd.get("dauer") ?? ""), 15, 720);
  const bild = String(fd.get("bild") ?? BILDER[0]);
  const zurueck = id ? `/admin/kurse/${id}` : "/admin/kurse";
  if (title.length < 2 || preis === null || plaetze === null || dauer === null || !BILDER.includes(bild)) {
    redirect(`${zurueck}?fehler=1`);
  }
  const werte = [
    title,
    String(fd.get("teaser") ?? "").trim().slice(0, 200),
    String(fd.get("description") ?? "").trim().slice(0, 5000),
    String(fd.get("includes") ?? "").trim().slice(0, 300),
    dauer, preis, plaetze, bild,
    fd.get("active") === "on",
    ganz(String(fd.get("sort") ?? "0"), -1000, 1000) ?? 0,
  ];
  if (id) {
    await query(
      `UPDATE courses SET title=$1, teaser=$2, description=$3, includes=$4, duration_min=$5, price_cents=$6, capacity=$7, image=$8, active=$9, sort=$10 WHERE id=$11`,
      [...werte, id],
    );
  } else {
    let slug = slugify(title);
    if ((await query("SELECT 1 FROM courses WHERE slug = $1", [slug])).length) slug = `${slug}-${Date.now().toString(36)}`;
    await query(
      `INSERT INTO courses (title, teaser, description, includes, duration_min, price_cents, capacity, image, active, sort, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [...werte, slug],
    );
  }
  revalidatePath("/", "layout");
  redirect("/admin/kurse?gespeichert=1");
}

export async function terminAnlegen(fd: FormData) {
  await pflichtAdmin();
  const kurs = await kursNachId(Number(fd.get("kurs")));
  const start = zurichToDate(String(fd.get("start") ?? ""));
  if (!kurs || !start) redirect("/admin/termine/neu?fehler=1");
  const preisEingabe = String(fd.get("preis") ?? "").trim();
  const plaetzeEingabe = String(fd.get("plaetze") ?? "").trim();
  const preis = preisEingabe ? rappen(preisEingabe) : kurs.price_cents;
  const plaetze = plaetzeEingabe ? ganz(plaetzeEingabe, 1, 40) : kurs.capacity;
  const dauer = ganz(String(fd.get("dauer") ?? kurs.duration_min), 15, 720) ?? kurs.duration_min;
  if (preis === null || plaetze === null) redirect("/admin/termine/neu?fehler=1");
  const ende = new Date(start.getTime() + dauer * 60_000);
  const neu = await query<{ id: number }>(
    `INSERT INTO sessions (course_id, starts_at, ends_at, price_cents, capacity, note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [kurs.id, start, ende, preis, plaetze, String(fd.get("note") ?? "").trim().slice(0, 200)],
  );
  revalidatePath("/", "layout");
  redirect(`/admin/termine/${neu[0].id}?neu=1`);
}

export async function terminAendern(fd: FormData) {
  await pflichtAdmin();
  const id = Number(fd.get("id"));
  const plaetze = ganz(String(fd.get("plaetze") ?? ""), 1, 40);
  if (!Number.isInteger(id) || plaetze === null) redirect(`/admin/termine/${id}?fehler=1`);
  await query("UPDATE sessions SET capacity = $1, note = $2 WHERE id = $3", [plaetze, String(fd.get("note") ?? "").trim().slice(0, 200), id]);
  revalidatePath("/", "layout");
  redirect(`/admin/termine/${id}?gespeichert=1`);
}

export async function buchungStornieren(fd: FormData) {
  await pflichtAdmin();
  const sessionId = Number(fd.get("session"));
  const f = await stornieren(Number(fd.get("buchung")), fd.get("rueckzahlen") === "on", String(fd.get("grund") ?? "").trim());
  revalidatePath("/", "layout");
  redirect(`/admin/termine/${sessionId}?${f ? `meldung=${encodeURIComponent(f)}` : "storniert=1"}`);
}

export async function terminAbsagenAktion(fd: FormData) {
  await pflichtAdmin();
  const id = Number(fd.get("id"));
  if (fd.get("sicher") !== "on") redirect(`/admin/termine/${id}?meldung=${encodeURIComponent("Bitte das Häkchen setzen, um den Termin abzusagen.")}`);
  const fehler = await terminAbsagen(id, String(fd.get("grund") ?? "").trim());
  revalidatePath("/", "layout");
  redirect(`/admin/termine/${id}?${fehler.length ? `meldung=${encodeURIComponent(fehler.join("; "))}` : "abgesagt=1"}`);
}
