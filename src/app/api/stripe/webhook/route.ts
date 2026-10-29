import { alsAbgelaufenMarkieren, alsBezahltMarkieren } from "@/lib/buchung";
import { webhookGueltig, type CheckoutSession } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/** Stripe meldet abgeschlossene oder abgelaufene Zahlungen. */
export async function POST(req: Request) {
  const body = await req.text();
  if (!webhookGueltig(body, req.headers.get("stripe-signature"), process.env.STRIPE_WEBHOOK_SECRET ?? "")) {
    return new Response("Ungültige Signatur", { status: 400 });
  }
  const ev = JSON.parse(body) as { type: string; data: { object: CheckoutSession } };
  const cs = ev.data.object;
  const token = cs.metadata?.booking_token;
  try {
    if ((ev.type === "checkout.session.completed" || ev.type === "checkout.session.async_payment_succeeded") && token && cs.payment_status === "paid") {
      await alsBezahltMarkieren(token, cs.payment_intent);
    } else if (ev.type === "checkout.session.expired" || ev.type === "checkout.session.async_payment_failed") {
      await alsAbgelaufenMarkieren(cs.id);
    }
  } catch (e) {
    console.error("[argi] Webhook fehlgeschlagen:", e);
    return new Response("Fehler", { status: 500 });
  }
  return Response.json({ ok: true });
}
