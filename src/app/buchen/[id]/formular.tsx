"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { buchenAktion, type Zustand } from "./aktion";

export function Formular(p: { sessionId: number; frei: number; preisCents: number; online: boolean; max: number }) {
  const [zustand, aktion, laeuft] = useActionState<Zustand, FormData>(buchenAktion.bind(null, p.sessionId), { fehler: null });
  const [anzahl, setAnzahl] = useState(1);
  const obergrenze = Math.min(p.frei, p.max);
  const total = (p.preisCents * anzahl) / 100;
  const totalText = Number.isInteger(total) ? `CHF ${total}.–` : `CHF ${total.toFixed(2)}`;

  return (
    <form action={aktion} className="form" noValidate={false}>
      {zustand.fehler && <p className="fehler" role="alert">{zustand.fehler}</p>}
      <div className="feld">
        <span id="anzahl-label">Anzahl Plätze</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" className="btn btn-small" aria-label="Einen Platz weniger" onClick={() => setAnzahl((n) => Math.max(1, n - 1))} disabled={anzahl <= 1} style={{ width: 48, padding: 0 }}>−</button>
          <output aria-labelledby="anzahl-label" aria-live="polite" style={{ minWidth: 28, textAlign: "center", fontWeight: 700, fontSize: 18, color: "var(--ink)" }}>{anzahl}</output>
          <button type="button" className="btn btn-small" aria-label="Einen Platz mehr" onClick={() => setAnzahl((n) => Math.min(obergrenze, n + 1))} disabled={anzahl >= obergrenze} style={{ width: 48, padding: 0 }}>+</button>
          <input type="hidden" name="seats" value={anzahl} />
        </div>
      </div>
      <label className="feld">Vor- und Nachname
        <input name="name" required minLength={2} maxLength={120} autoComplete="name" />
      </label>
      <label className="feld">E-Mail
        <input name="email" type="email" required maxLength={200} autoComplete="email" />
      </label>
      <label className="feld">Telefon (freiwillig, für kurzfristige Änderungen)
        <input name="phone" type="tel" maxLength={40} autoComplete="tel" />
      </label>
      <label className="feld">Nachricht an Argi (freiwillig)
        <textarea name="message" maxLength={1000} placeholder="Allergien, Wünsche, Namen der Begleitpersonen …" />
      </label>
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
        <label>Firma <input name="firma" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="check">
        <input type="checkbox" name="agb" required />
        <span>Ich habe die <Link href="/agb" target="_blank">Teilnahmebedingungen</Link> gelesen und bin einverstanden.</span>
      </label>
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, paddingTop: 8, borderTop: "1px solid var(--line)" }}>
        <span>Total</span><span>{totalText}</span>
      </div>
      <button type="submit" className="btn btn-accent" disabled={laeuft}>
        {laeuft ? "Einen Moment …" : p.online && p.preisCents > 0 ? "Weiter zur Zahlung (TWINT oder Karte)" : "Verbindlich reservieren"}
      </button>
      <p className="small muted" style={{ margin: 0 }}>
        {p.online
          ? "Dein Platz ist fest, sobald die Zahlung durch ist. Die Bestätigung kommt per E-Mail."
          : "Bezahlt wird vor Ort mit TWINT oder bar. Die Bestätigung kommt per E-Mail."}
      </p>
    </form>
  );
}
