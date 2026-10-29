import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** /api/health: Prozess lebt. /api/health?tief: zusätzlich Datenbank. */
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.has("tief")) {
    try {
      await query("SELECT 1");
    } catch {
      return Response.json({ ok: false, db: false }, { status: 503 });
    }
    return Response.json({ ok: true, db: true });
  }
  return Response.json({ ok: true });
}
