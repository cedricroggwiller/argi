import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { chf, dateToZurichInput, uhrzeit, zurichToDate } from "./zeit.ts";
import { belegtePlaetze, buchbar, plaetzeText, pruefeEingabe } from "./plaetze.ts";
import { ics } from "./ics.ts";
import { webhookGueltig } from "./stripe.ts";
import { cookieGueltig, cookieWert } from "./auth.ts";

test("Zürcher Ortszeit: Winter (UTC+1) und Sommer (UTC+2)", () => {
  assert.equal(zurichToDate("2026-11-12T18:30")?.toISOString(), "2026-11-12T17:30:00.000Z");
  assert.equal(zurichToDate("2026-07-01T09:00")?.toISOString(), "2026-07-01T07:00:00.000Z");
  assert.equal(zurichToDate("2026-13-01T09:00"), null);
  assert.equal(zurichToDate("morgen"), null);
});

test("Zürcher Ortszeit hin und zurück, auch an der Umstellung", () => {
  for (const s of ["2026-10-25T01:30", "2026-10-25T03:30", "2026-03-29T03:30", "2026-12-31T23:45"]) {
    assert.equal(dateToZurichInput(zurichToDate(s)!), s);
  }
  assert.equal(uhrzeit(new Date("2026-11-12T17:30:00Z")), "18:30");
});

test("CHF-Format", () => {
  assert.equal(chf(9500), "CHF 95.–");
  assert.equal(chf(9250), "CHF 92.50");
  assert.equal(chf(125000), "CHF 1’250.–");
});

test("belegte Plätze zählen nur gültige Buchungen", () => {
  const jetzt = new Date("2026-11-01T10:00:00Z");
  const bald = new Date("2026-11-01T10:20:00Z");
  const vorbei = new Date("2026-11-01T09:00:00Z");
  assert.equal(belegtePlaetze([
    { status: "paid", seats: 2, expires_at: null },
    { status: "reserved", seats: 1, expires_at: null },
    { status: "pending", seats: 3, expires_at: bald },
    { status: "pending", seats: 4, expires_at: vorbei },
    { status: "expired", seats: 5, expires_at: null },
    { status: "cancelled", seats: 6, expires_at: null },
  ], jetzt), 6);
});

test("buchbar bis 2 Stunden vor Beginn, nicht wenn abgesagt", () => {
  const start = new Date("2026-11-12T17:30:00Z");
  assert.equal(buchbar(start, null, new Date("2026-11-12T15:00:00Z")), true);
  assert.equal(buchbar(start, null, new Date("2026-11-12T16:00:00Z")), false);
  assert.equal(buchbar(start, new Date(), new Date("2026-11-01T00:00:00Z")), false);
});

test("Eingaben werden geprüft", () => {
  const gut = { name: "Anna Muster", email: "anna@example.ch", phone: "", message: "", seats: 2, agb: true };
  assert.equal(pruefeEingabe(gut, 5), null);
  assert.match(pruefeEingabe({ ...gut, email: "anna@" }, 5)!, /E-Mail/);
  assert.match(pruefeEingabe({ ...gut, seats: 3 }, 2)!, /nur noch 2/);
  assert.match(pruefeEingabe({ ...gut, seats: 1 }, 0)!, /ausgebucht/);
  assert.match(pruefeEingabe({ ...gut, seats: 7 }, 10)!, /1 bis 6/);
  assert.match(pruefeEingabe({ ...gut, agb: false }, 5)!, /Teilnahmebedingungen/);
  assert.equal(plaetzeText(0), "Ausgebucht");
  assert.equal(plaetzeText(1), "Noch 1 Platz");
  assert.equal(plaetzeText(5), "5 Plätze frei");
});

test("Kalendereintrag ist gültig gefaltet und maskiert", () => {
  const s = ics({
    uid: "x@argi", start: new Date("2026-11-12T17:30:00Z"), end: new Date("2026-11-12T20:30:00Z"),
    title: "Töpferkurs: Drehscheibe, Einsteiger", location: "Kafi Hoi Zäme; Keller", description: "a".repeat(200),
  }, new Date("2026-10-29T12:00:00Z"));
  assert.match(s, /DTSTART:20261112T173000Z/);
  assert.match(s, /SUMMARY:Töpferkurs: Drehscheibe\\, Einsteiger/);
  assert.match(s, /LOCATION:Kafi Hoi Zäme\\; Keller/);
  for (const line of s.split("\r\n")) assert.ok(Buffer.byteLength(line) <= 75, line);
});

test("Stripe-Webhook-Signatur", () => {
  const secret = "whsec_test";
  const body = '{"type":"checkout.session.completed"}';
  const t = 1_800_000_000;
  const sig = createHmac("sha256", secret).update(`${t}.${body}`).digest("hex");
  assert.equal(webhookGueltig(body, `t=${t},v1=${sig}`, secret, t + 10), true);
  assert.equal(webhookGueltig(body + " ", `t=${t},v1=${sig}`, secret, t + 10), false);
  assert.equal(webhookGueltig(body, `t=${t},v1=${sig}`, secret, t + 1000), false);
  assert.equal(webhookGueltig(body, null, secret), false);
  assert.equal(webhookGueltig(body, `t=${t},v1=${sig}`, "", t), false);
});

test("Admin-Cookie: gültig, abgelaufen, manipuliert", () => {
  process.env.AUTH_SECRET = "x".repeat(40);
  const jetzt = 1_800_000_000;
  const c = cookieWert(jetzt);
  assert.equal(cookieGueltig(c, jetzt + 60), true);
  assert.equal(cookieGueltig(c, jetzt + 15 * 24 * 3600), false);
  const [exp, sig] = c.split(".");
  assert.equal(cookieGueltig(`${Number(exp) + 1000}.${sig}`, jetzt), false);
  assert.equal(cookieGueltig(undefined, jetzt), false);
});
