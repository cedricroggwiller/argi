import { createHmac, timingSafeEqual } from "node:crypto";

/** Schlanker Stripe-Zugriff über die REST-API (kein SDK nötig). */

export function stripeAktiv(): boolean {
  return !!process.env.STRIPE_SECRET_KEY;
}

async function call<T>(method: "GET" | "POST", path: string, form?: Record<string, string>, idempotencyKey?: string): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY fehlt");
  const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
  if (form) headers["Content-Type"] = "application/x-www-form-urlencoded";
  if (idempotencyKey) headers["Idempotency-Key"] = idempotencyKey;
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers,
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const json = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) throw new Error(`Stripe ${path}: ${json.error?.message ?? res.status}`);
  return json;
}

export type CheckoutSession = {
  id: string;
  url: string | null;
  status: "open" | "complete" | "expired";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  payment_intent: string | null;
  metadata: Record<string, string>;
};

export async function checkoutErstellen(o: {
  token: string;
  bezeichnung: string;
  stueckpreisCents: number;
  anzahl: number;
  email: string;
  erfolgUrl: string;
  abbruchUrl: string;
  ablauf: Date;
}): Promise<CheckoutSession> {
  return call<CheckoutSession>("POST", "/checkout/sessions", {
    mode: "payment",
    "payment_method_types[0]": "card",
    "payment_method_types[1]": "twint",
    "line_items[0][quantity]": String(o.anzahl),
    "line_items[0][price_data][currency]": "chf",
    "line_items[0][price_data][unit_amount]": String(o.stueckpreisCents),
    "line_items[0][price_data][product_data][name]": o.bezeichnung,
    customer_email: o.email,
    client_reference_id: o.token,
    "metadata[booking_token]": o.token,
    success_url: o.erfolgUrl,
    cancel_url: o.abbruchUrl,
    expires_at: String(Math.floor(o.ablauf.getTime() / 1000)),
    locale: "de",
  }, `checkout-${o.token}`);
}

export function checkoutLesen(id: string): Promise<CheckoutSession> {
  return call<CheckoutSession>("GET", `/checkout/sessions/${encodeURIComponent(id)}`);
}

export function rueckerstatten(paymentIntent: string, token: string): Promise<{ id: string; status: string }> {
  return call("POST", "/refunds", { payment_intent: paymentIntent }, `refund-${token}`);
}

/**
 * Prüft die Signatur eines Webhooks (Header "Stripe-Signature": t=…,v1=…).
 * Gibt true nur bei gültiger Signatur innerhalb der Toleranz.
 */
export function webhookGueltig(body: string, header: string | null, secret: string, jetztSek = Math.floor(Date.now() / 1000), toleranzSek = 300): boolean {
  if (!header || !secret) return false;
  const teile = header.split(",").map((p) => p.trim().split("="));
  const t = teile.find(([k]) => k === "t")?.[1];
  const sigs = teile.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !/^\d+$/.test(t) || sigs.length === 0) return false;
  if (Math.abs(jetztSek - Number(t)) > toleranzSek) return false;
  const erwartet = Buffer.from(createHmac("sha256", secret).update(`${t}.${body}`).digest("hex"));
  return sigs.some((s) => {
    const b = Buffer.from(s);
    return b.length === erwartet.length && timingSafeEqual(b, erwartet);
  });
}
