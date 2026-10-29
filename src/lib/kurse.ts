import { query } from "./db";
import { belegtePlaetze, buchbar } from "./plaetze";

export type Kurs = {
  id: number; slug: string; title: string; teaser: string; description: string; includes: string;
  duration_min: number; price_cents: number; capacity: number; image: string; active: boolean; sort: number;
};

export type Termin = {
  id: number; course_id: number; starts_at: Date; ends_at: Date; price_cents: number; capacity: number;
  note: string; cancelled_at: Date | null;
  course_title: string; course_slug: string; course_teaser: string; course_image: string;
  belegt: number; frei: number; buchbar: boolean;
};

const TERMIN_SQL = `
  SELECT s.*, c.title AS course_title, c.slug AS course_slug, c.teaser AS course_teaser, c.image AS course_image,
    COALESCE((SELECT json_agg(json_build_object('status', b.status, 'seats', b.seats, 'expires_at', b.expires_at))
              FROM bookings b WHERE b.session_id = s.id), '[]') AS belegung
  FROM sessions s JOIN courses c ON c.id = s.course_id`;

type Roh = Omit<Termin, "belegt" | "frei" | "buchbar"> & { belegung: { status: string; seats: number; expires_at: string | null }[] };

function mitBelegung(r: Roh, jetzt = new Date()): Termin {
  const { belegung, ...rest } = r;
  const belegt = belegtePlaetze(belegung.map((b) => ({ ...b, expires_at: b.expires_at ? new Date(b.expires_at) : null })), jetzt);
  return { ...rest, belegt, frei: Math.max(0, r.capacity - belegt), buchbar: buchbar(r.starts_at, r.cancelled_at, jetzt) };
}

/** Kommende, nicht abgesagte Termine für die öffentliche Seite. */
export async function kommendeTermine(limit = 50): Promise<Termin[]> {
  const rows = await query<Roh>(`${TERMIN_SQL} WHERE s.starts_at > now() AND s.cancelled_at IS NULL AND c.active ORDER BY s.starts_at LIMIT $1`, [limit]);
  return rows.map((r) => mitBelegung(r));
}

export async function termin(id: number): Promise<Termin | null> {
  const rows = await query<Roh>(`${TERMIN_SQL} WHERE s.id = $1`, [id]);
  return rows[0] ? mitBelegung(rows[0]) : null;
}

/** Für die Verwaltung: alle Termine ab einem Monat in der Vergangenheit. */
export async function alleTermine(): Promise<Termin[]> {
  const rows = await query<Roh>(`${TERMIN_SQL} WHERE s.starts_at > now() - interval '31 days' ORDER BY s.starts_at`);
  return rows.map((r) => mitBelegung(r));
}

export async function aktiveKurse(): Promise<Kurs[]> {
  return query<Kurs>("SELECT * FROM courses WHERE active ORDER BY sort, id");
}

export async function alleKurse(): Promise<Kurs[]> {
  return query<Kurs>("SELECT * FROM courses ORDER BY active DESC, sort, id");
}

export async function kursNachSlug(slug: string): Promise<Kurs | null> {
  return (await query<Kurs>("SELECT * FROM courses WHERE slug = $1", [slug]))[0] ?? null;
}

export async function kursNachId(id: number): Promise<Kurs | null> {
  return (await query<Kurs>("SELECT * FROM courses WHERE id = $1", [id]))[0] ?? null;
}

export async function termineVonKurs(courseId: number): Promise<Termin[]> {
  const rows = await query<Roh>(`${TERMIN_SQL} WHERE s.course_id = $1 AND s.starts_at > now() AND s.cancelled_at IS NULL ORDER BY s.starts_at`, [courseId]);
  return rows.map((r) => mitBelegung(r));
}

export function slugify(s: string): string {
  return s.toLowerCase()
    .replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss")
    .normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "kurs";
}
