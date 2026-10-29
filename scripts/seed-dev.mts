/**
 * Beispieldaten für die lokale Entwicklung (nie in Produktion ausführen):
 * vier Kursarten mit Platzhalterpreisen und einige Termine in den nächsten Wochen.
 *
 *   npm run seed:dev  (scripts/seed-dev.mts)
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

for (const f of [".env.local", ".env"]) {
  const p = join(process.cwd(), f);
  if (!existsSync(p)) continue;
  for (const line of readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2];
  }
}

const { migrate } = await import("../src/lib/migrate.ts");
const { query, pool } = await import("../src/lib/db.ts");
const { zurichToDate } = await import("../src/lib/zeit.ts");

if (!/localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "")) {
  console.error("Nur gegen eine lokale Datenbank.");
  process.exit(1);
}

await migrate();
const kurse = [
  ["drehscheibe-fuer-einsteiger", "Drehscheibe für Einsteiger", "Becher und Schalen drehen", 180, 9500, 6, "/bilder/drehscheibe.jpg"],
  ["handaufbau-tasse-und-teller", "Handaufbau: Tasse und Teller", "ohne Drehscheibe, entspannt", 180, 8500, 8, "/bilder/becher-hand.jpg"],
  ["drehscheibe-zu-zweit", "Drehscheibe zu zweit", "für Paare und Freundinnen", 180, 9500, 6, "/bilder/becher-gestapelt.jpg"],
  ["glasurabend", "Glasurabend", "eigene Stücke bemalen", 150, 4500, 8, "/bilder/vase-kobalt.jpg"],
] as const;
for (const [slug, title, teaser, dauer, preis, plaetze, bild] of kurse) {
  await query(
    `INSERT INTO courses (slug, title, teaser, description, includes, duration_min, price_cents, capacity, image)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (slug) DO NOTHING`,
    [slug, title, teaser, "Beispieltext für die Entwicklung.\n\nZweiter Absatz.", "Ton, Glasur und Brand", dauer, preis, plaetze, bild],
  );
}
const ids = await query<{ id: number; slug: string; duration_min: number; price_cents: number; capacity: number }>("SELECT id, slug, duration_min, price_cents, capacity FROM courses");
const heute = new Date();
const plan: [string, number, string][] = [
  ["drehscheibe-fuer-einsteiger", 10, "18:30"],
  ["handaufbau-tasse-und-teller", 17, "14:30"],
  ["drehscheibe-zu-zweit", 24, "18:30"],
  ["glasurabend", 31, "18:00"],
];
if ((await query("SELECT 1 FROM sessions LIMIT 1")).length === 0) {
  for (const [slug, tage, zeit] of plan) {
    const k = ids.find((x) => x.slug === slug)!;
    const d = new Date(heute.getTime() + tage * 86400_000).toISOString().slice(0, 10);
    const start = zurichToDate(`${d}T${zeit}`)!;
    await query("INSERT INTO sessions (course_id, starts_at, ends_at, price_cents, capacity) VALUES ($1,$2,$3,$4,$5)",
      [k.id, start, new Date(start.getTime() + k.duration_min * 60000), k.price_cents, k.capacity]);
  }
}
console.log("Beispieldaten angelegt.");
await pool().end();
