/** Reine Regeln rund um Plätze und Buchungen, ohne Datenbank (getestet). */

export type BelegungsZeile = { status: string; seats: number; expires_at: Date | null };

/** Belegt sind bezahlte, reservierte und noch nicht abgelaufene offene Buchungen. */
export function belegtePlaetze(rows: BelegungsZeile[], jetzt: Date): number {
  return rows.reduce((sum, r) => {
    if (r.status === "paid" || r.status === "reserved") return sum + r.seats;
    if (r.status === "pending" && r.expires_at && r.expires_at.getTime() > jetzt.getTime()) return sum + r.seats;
    return sum;
  }, 0);
}

/** Höchstens so viele Plätze in einer Buchung. */
export const MAX_PRO_BUCHUNG = 6;

/** Wie lange Plätze während der Zahlung gehalten werden (Stripe verlangt mind. 30 Min.). */
export const HALTEN_MIN = 31;

/** Ab wann ein Termin nicht mehr buchbar ist: 2 Stunden vor Beginn. */
export function buchbar(startsAt: Date, cancelledAt: Date | null, jetzt: Date): boolean {
  return !cancelledAt && startsAt.getTime() - jetzt.getTime() > 2 * 3600_000;
}

export type Eingabe = { name: string; email: string; phone: string; message: string; seats: number; agb: boolean };

export function pruefeEingabe(e: Eingabe, frei: number): string | null {
  if (e.name.trim().length < 2 || e.name.length > 120) return "Bitte gib deinen Namen an.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.email.trim()) || e.email.length > 200) return "Bitte prüfe die E-Mail-Adresse.";
  if (e.phone.length > 40) return "Die Telefonnummer ist zu lang.";
  if (e.message.length > 1000) return "Die Nachricht ist zu lang (höchstens 1000 Zeichen).";
  if (!Number.isInteger(e.seats) || e.seats < 1 || e.seats > MAX_PRO_BUCHUNG) return `Du kannst 1 bis ${MAX_PRO_BUCHUNG} Plätze buchen.`;
  if (e.seats > frei) return frei === 0 ? "Dieser Termin ist leider ausgebucht." : `Es sind nur noch ${frei} Plätze frei.`;
  if (!e.agb) return "Bitte bestätige die Teilnahmebedingungen.";
  return null;
}

export function plaetzeText(frei: number): string {
  if (frei <= 0) return "Ausgebucht";
  if (frei === 1) return "Noch 1 Platz";
  if (frei <= 2) return `Noch ${frei} Plätze`;
  return `${frei} Plätze frei`;
}
