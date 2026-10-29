import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fuss, Kopf } from "../../teile";
import { Formular } from "./formular";
import { termin } from "@/lib/kurse";
import { MAX_PRO_BUCHUNG, plaetzeText } from "@/lib/plaetze";
import { stripeAktiv } from "@/lib/stripe";
import { ORT_ZEILE, SITE } from "@/lib/site";
import { chf, datumLang, zeitspanne } from "@/lib/zeit";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Buchen", robots: { index: false } };

export default async function Buchen(props: PageProps<"/buchen/[id]">) {
  const id = Number((await props.params).id);
  if (!Number.isInteger(id)) notFound();
  const t = await termin(id);
  if (!t) notFound();
  const offen = t.buchbar && t.frei > 0;

  return (
    <>
      <Kopf />
      <main className="narrow seite">
        <p><Link href="/#kurse">← Alle Termine</Link></p>
        <div className="karte" style={{ display: "flex", flexWrap: "wrap", gap: 40 }}>
          <div style={{ flex: "1 1 280px", display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="eyebrow">Deine Buchung</span>
            <h1 style={{ fontSize: 36, marginBottom: 4 }}>{t.course_title}</h1>
            <span style={{ color: "var(--ink-2)" }}>{datumLang(t.starts_at)}</span>
            <span style={{ color: "var(--ink-2)" }}>{zeitspanne(t.starts_at, t.ends_at)} Uhr</span>
            <span style={{ color: "var(--ink-2)" }}>{ORT_ZEILE}</span>
            <span style={{ color: "var(--ink-2)" }}>{chf(t.price_cents)} pro Person · {plaetzeText(t.frei)}</span>
            {t.note && <span className="small muted">{t.note}</span>}
          </div>
          <div style={{ flex: "1 1 360px" }}>
            {offen ? (
              <Formular sessionId={t.id} frei={t.frei} preisCents={t.price_cents} online={stripeAktiv()} max={MAX_PRO_BUCHUNG} />
            ) : (
              <div className="form">
                <p className="hinweis" style={{ margin: 0 }}>
                  {t.cancelled_at ? "Dieser Termin wurde abgesagt." : t.frei === 0 ? "Dieser Termin ist ausgebucht." : "Dieser Termin kann online nicht mehr gebucht werden."}
                </p>
                <a className="btn" href={`mailto:${SITE.kontaktEmail}?subject=${encodeURIComponent(`Warteliste: ${t.course_title}`)}`}>Auf die Warteliste</a>
                <Link className="btn btn-dark" href="/#kurse">Andere Termine ansehen</Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Fuss />
    </>
  );
}
