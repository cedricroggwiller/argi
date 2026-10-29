import { buchungNachToken } from "@/lib/buchung";
import { ics } from "@/lib/ics";
import { appUrl, ORT_ZEILE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: RouteContext<"/api/buchung/[token]/kalender">) {
  const { token } = await ctx.params;
  const b = await buchungNachToken(token);
  if (!b || !(b.status === "paid" || b.status === "reserved")) return new Response("Nicht gefunden", { status: 404 });
  const body = ics({
    uid: `buchung-${b.token}@argi`,
    start: b.starts_at,
    end: b.ends_at,
    title: `Töpferkurs: ${b.course_title}`,
    location: ORT_ZEILE,
    description: `${b.seats} Platz/Plätze`,
    url: `${appUrl()}/buchung/${b.token}`,
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="toepferkurs.ics"',
      "Cache-Control": "no-store",
    },
  });
}
