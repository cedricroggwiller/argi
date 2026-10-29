import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { pool } from "./db";

/** Spielt db/*.sql der Reihe nach ein, jede Datei genau einmal. */
export async function migrate(dir = join(process.cwd(), "db")): Promise<void> {
  if (!existsSync(dir)) return;
  const c = await pool().connect();
  try {
    // Verhindert, dass zwei Instanzen gleichzeitig migrieren.
    await c.query("SELECT pg_advisory_lock(424242)");
    await c.query("CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())");
    const done = new Set((await c.query("SELECT name FROM schema_migrations")).rows.map((r) => r.name as string));
    for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
      if (done.has(f)) continue;
      await c.query("BEGIN");
      try {
        await c.query(readFileSync(join(dir, f), "utf8"));
        await c.query("INSERT INTO schema_migrations (name) VALUES ($1)", [f]);
        await c.query("COMMIT");
        console.log(`[argi] Migration ${f} eingespielt`);
      } catch (e) {
        await c.query("ROLLBACK");
        throw e;
      }
    }
  } finally {
    await c.query("SELECT pg_advisory_unlock(424242)").catch(() => {});
    c.release();
  }
}
