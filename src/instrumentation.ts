/** Läuft einmal beim Start des Servers (nur Node-Runtime): siehe lib/start.ts. */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/start");
  }
}
