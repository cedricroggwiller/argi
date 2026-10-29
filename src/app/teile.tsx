import Link from "next/link";
import { SITE } from "@/lib/site";
import { chf, monat, tag, wochentag, zeitspanne } from "@/lib/zeit";
import { plaetzeText } from "@/lib/plaetze";
import type { Termin } from "@/lib/kurse";

export function Kopf() {
  return (
    <div className="wrap nav">
      <Link href="/" className="brand">argi</Link>
      <nav className="nav-links" aria-label="Hauptnavigation">
        <Link href="/#kurse">Kurse</Link>
        <Link href="/#anfangen">So geht’s</Link>
        <Link href="/#werkstatt">Werkstatt</Link>
        <Link href="/#ort">Ort</Link>
        <Link href="/gutscheine">Gutscheine</Link>
        <Link href="/#kurse" className="btn btn-dark btn-small">Kurs buchen</Link>
      </nav>
    </div>
  );
}

export function Fuss() {
  return (
    <footer className="fuss">
      <div className="wrap">
        <span>argi · {SITE.claim}</span>
        <nav aria-label="Weitere Seiten">
          <a href={SITE.instagram} rel="noopener">Instagram</a>
          <Link href="/gruppen">Private Gruppen</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/impressum">Impressum</Link>
          <Link href="/datenschutz">Datenschutz</Link>
          <Link href="/agb">Teilnahmebedingungen</Link>
        </nav>
      </div>
    </footer>
  );
}

export function TerminZeile({ t }: { t: Termin }) {
  const klasse = t.frei === 0 ? "voll" : t.frei <= 2 ? "knapp" : "";
  return (
    <div className="termin">
      <div className="termin-datum">
        <span className="tag">{tag(t.starts_at)}</span>
        <span className="small muted">{monat(t.starts_at)} · {wochentag(t.starts_at)}</span>
      </div>
      <div className="termin-info">
        <strong><Link href={`/kurse/${t.course_slug}`}>{t.course_title}</Link></strong>
        <span className="small" style={{ color: "var(--ink-2)" }}>
          {zeitspanne(t.starts_at, t.ends_at)} Uhr{t.course_teaser ? ` · ${t.course_teaser}` : ""}
          {t.note ? ` · ${t.note}` : ""}
        </span>
      </div>
      <div className={`termin-plaetze ${klasse}`}>{plaetzeText(t.frei)}</div>
      <div className="termin-aktion">
        <span className="small" style={{ color: "var(--ink-2)" }}>{chf(t.price_cents)}</span>
        {t.frei > 0 && t.buchbar ? (
          <Link href={`/buchen/${t.id}`} className="btn btn-small">Buchen</Link>
        ) : (
          <a href={`mailto:${SITE.kontaktEmail}?subject=${encodeURIComponent(`Warteliste: ${t.course_title}`)}`} className="btn btn-small">Warteliste</a>
        )}
      </div>
    </div>
  );
}
