import { istAdmin } from "@/lib/admin";
import { buchungenVonTermin } from "@/lib/buchung";
import { termin } from "@/lib/kurse";

export const dynamic = "force-dynamic";

function zelle(v: string | number): string {
  const s = String(v);
  // Formeln in Tabellenprogrammen entschärfen.
  const sicher = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${sicher.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/admin/termine/[id]/csv">) {
  if (!(await istAdmin())) return new Response("Nicht angemeldet", { status: 401 });
  const id = Number((await ctx.params).id);
  const t = Number.isInteger(id) ? await termin(id) : null;
  if (!t) return new Response("Nicht gefunden", { status: 404 });
  const zeilen = [["Name", "E-Mail", "Telefon", "Plätze", "Betrag CHF", "Stand", "Nachricht"]];
  for (const b of await buchungenVonTermin(id)) {
    if (b.status === "expired") continue;
    zeilen.push([b.name, b.email, b.phone, String(b.seats), (b.amount_cents / 100).toFixed(2), b.status, b.message]);
  }
  const csv = "﻿" + zeilen.map((z) => z.map(zelle).join(";")).join("\r\n");
  const datum = t.starts_at.toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="teilnehmende-${datum}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
