import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/** Admin-Anmeldung: ein Passwort (ADMIN_PASSWORD), Cookie mit Ablauf und HMAC. */

export const COOKIE = "argi_admin";
export const DAUER_SEK = 14 * 24 * 3600;

function secret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET fehlt oder ist kürzer als 32 Zeichen");
  return s;
}

function sig(wert: string): string {
  return createHmac("sha256", secret()).update(wert).digest("base64url");
}

function gleich(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function passwortRichtig(eingabe: string): boolean {
  const soll = process.env.ADMIN_PASSWORD;
  if (!soll) return false;
  const h = (s: string) => createHash("sha256").update(s).digest("hex");
  return gleich(h(eingabe), h(soll));
}

export function cookieWert(jetztSek = Math.floor(Date.now() / 1000)): string {
  const exp = String(jetztSek + DAUER_SEK);
  return `${exp}.${sig(exp)}`;
}

export function cookieGueltig(wert: string | undefined, jetztSek = Math.floor(Date.now() / 1000)): boolean {
  if (!wert) return false;
  const [exp, s] = wert.split(".");
  if (!exp || !s || !/^\d+$/.test(exp) || Number(exp) < jetztSek) return false;
  return gleich(s, sig(exp));
}

/** Einfache Bremse gegen Durchprobieren: höchstens 5 Fehlversuche je 15 Min. und Adresse. */
const versuche = new Map<string, { n: number; bis: number }>();
export function gesperrt(ip: string, jetzt = Date.now()): boolean {
  const v = versuche.get(ip);
  return !!v && v.bis > jetzt && v.n >= 5;
}
export function fehlversuch(ip: string, jetzt = Date.now()): void {
  const v = versuche.get(ip);
  if (!v || v.bis < jetzt) versuche.set(ip, { n: 1, bis: jetzt + 15 * 60_000 });
  else v.n++;
}
