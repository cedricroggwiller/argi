import { migrate } from "./migrate";
import { erinnerungenSchicken } from "./buchung";

/** Läuft einmal beim Start: Migrationen, danach jede Minute Erinnerungen. */
const g = globalThis as unknown as { argiTakt?: NodeJS.Timeout };

async function takt() {
  try {
    await erinnerungenSchicken();
  } catch (e) {
    console.error("[argi] Takt fehlgeschlagen:", e);
  }
}

if (process.env.DATABASE_URL) {
  await migrate();
  if (!g.argiTakt) {
    g.argiTakt = setInterval(takt, 60_000);
    g.argiTakt.unref();
  }
} else {
  console.warn("[argi] DATABASE_URL fehlt: keine Migrationen, keine Erinnerungen");
}
