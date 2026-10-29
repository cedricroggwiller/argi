export const TZ = "Europe/Zurich";

/** Versatz der Zürcher Ortszeit gegenüber UTC in Minuten zum Zeitpunkt `d`. */
function offsetMin(d: Date): number {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return Math.round((asUtc - d.getTime()) / 60000);
}

/** "2026-11-12T18:30" als Zürcher Ortszeit → Date. Gibt null bei ungültiger Eingabe. */
export function zurichToDate(local: string): Date | null {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/);
  if (!m) return null;
  if (+m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31 || +m[4] > 23 || +m[5] > 59) return null;
  const naive = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
  let t = naive - offsetMin(new Date(naive)) * 60000;
  // Zweiter Durchgang, falls der Versatz um die Umstellung herum wechselt.
  t = naive - offsetMin(new Date(t)) * 60000;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Date → "2026-11-12T18:30" in Zürcher Ortszeit (für datetime-local). */
export function dateToZurichInput(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(d).map((x) => [x.type, x.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("de-CH", { timeZone: TZ, ...o });
const fDay = fmt({ day: "2-digit" });
const fMonth = fmt({ month: "short" });
const fWeekday = fmt({ weekday: "short" });
const fLong = fmt({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fTime = fmt({ hour: "2-digit", minute: "2-digit" });

export const tag = (d: Date) => fDay.format(d);
export const monat = (d: Date) => fMonth.format(d).replace(".", "");
export const wochentag = (d: Date) => fWeekday.format(d).replace(".", "");
export const datumLang = (d: Date) => fLong.format(d);
export const uhrzeit = (d: Date) => fTime.format(d);
export const zeitspanne = (a: Date, b: Date) => `${uhrzeit(a)}–${uhrzeit(b)}`;

/** Rappen → "CHF 95.–" bzw. "CHF 92.50" */
export function chf(cents: number): string {
  const fr = Math.floor(cents / 100);
  const rp = cents % 100;
  // Tausendertrennzeichen selbst setzen: ICU-Versionen liefern ' oder ’.
  const s = String(fr).replace(/\B(?=(\d{3})+(?!\d))/g, "’");
  return rp === 0 ? `CHF ${s}.–` : `CHF ${s}.${String(rp).padStart(2, "0")}`;
}
