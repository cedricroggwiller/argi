/** Zeichnungen und kleine Animationen rund ums Töpfern (reines SVG + CSS, siehe globals.css «Deko»). */

const TON = "#c9a68a";
const TON_DUNKEL = "#a8826a";
const LINIE = "#2b2420";

/** Drehscheibe von der Seite, auf der ein Becher hochgezogen wird. */
export function Drehscheibe({ className = "" }: { className?: string }) {
  return (
    <svg className={`drehscheibe ${className}`} viewBox="0 0 240 200" role="img" aria-label="Ein Becher wächst auf der Drehscheibe">
      {/* Spritzer */}
      <g className="spritzer" fill={TON_DUNKEL}>
        <circle cx="70" cy="120" r="2.2" />
        <circle cx="176" cy="114" r="1.8" />
        <circle cx="60" cy="104" r="1.5" />
      </g>
      {/* Becher */}
      <g className="becher">
        <path d="M86 150 C 84 120, 88 96, 92 80 L 148 80 C 152 96, 156 120, 154 150 Z" fill={TON} stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="120" cy="80" rx="28" ry="6" fill={TON_DUNKEL} stroke={LINIE} strokeWidth="2.5" />
        <path className="rillen" d="M90 128 C 110 133, 130 133, 151 128 M89 110 C 110 115, 130 115, 150 110" fill="none" stroke={TON_DUNKEL} strokeWidth="2" strokeLinecap="round" />
      </g>
      {/* Scheibe */}
      <ellipse cx="120" cy="156" rx="86" ry="14" fill="#e6dacb" stroke={LINIE} strokeWidth="2.5" />
      <ellipse className="scheibe-rand" cx="120" cy="156" rx="86" ry="14" fill="none" stroke={LINIE} strokeWidth="2.5" strokeDasharray="10 16" />
      <path d="M50 164 L 58 190 L 182 190 L 190 164" fill="#f4eee6" stroke={LINIE} strokeWidth="2.5" strokeLinejoin="round" />
      {/* Wassertropfen */}
      <path className="tropfen" d="M120 30 C 116 38, 114 42, 120 46 C 126 42, 124 38, 120 30 Z" fill="#7d9bb5" />
    </svg>
  );
}

function Kneten() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <ellipse cx="40" cy="58" rx="30" ry="4" fill="#e6dacb" />
      <path className="klumpen" d="M14 54 C 10 38, 24 24, 40 24 C 58 24, 70 38, 66 54 Z" fill={TON} stroke={LINIE} strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}

function Zentrieren() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <path d="M28 46 C 28 38, 32 34, 40 34 C 48 34, 52 38, 52 46 Z" fill={TON} stroke={LINIE} strokeWidth="2.2" strokeLinejoin="round" />
      <ellipse cx="40" cy="50" rx="30" ry="7" fill="#e6dacb" stroke={LINIE} strokeWidth="2.2" />
      <ellipse className="scheibe-rand" cx="40" cy="50" rx="30" ry="7" fill="none" stroke={LINIE} strokeWidth="2.2" strokeDasharray="6 9" />
    </svg>
  );
}

function Hochziehen() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <g className="becher">
        <path d="M27 50 C 26 36, 28 26, 30 18 L 50 18 C 52 26, 54 36, 53 50 Z" fill={TON} stroke={LINIE} strokeWidth="2.2" strokeLinejoin="round" />
        <ellipse cx="40" cy="18" rx="10" ry="2.6" fill={TON_DUNKEL} stroke={LINIE} strokeWidth="2.2" />
      </g>
      <ellipse cx="40" cy="52" rx="30" ry="6" fill="#e6dacb" stroke={LINIE} strokeWidth="2.2" />
    </svg>
  );
}

function Brennen() {
  return (
    <svg viewBox="0 0 80 64" aria-hidden="true">
      <rect x="16" y="14" width="48" height="44" rx="6" fill="#4e4139" stroke={LINIE} strokeWidth="2.2" />
      <rect x="24" y="22" width="32" height="26" rx="4" fill="#2b2420" />
      <path className="flamme" d="M40 46 C 32 44, 32 36, 36 32 C 36 36, 38 37, 39 36 C 38 31, 41 27, 44 25 C 43 30, 48 33, 47 39 C 46 44, 44 46, 40 46 Z" fill="#e0894f" />
      <circle cx="56" cy="54" r="2" fill="#e0894f" className="gluehen" />
    </svg>
  );
}

const SCHRITTE = [
  { titel: "Kneten", text: "Luft raus, Hände warm", Bild: Kneten },
  { titel: "Zentrieren", text: "Der Ton läuft rund", Bild: Zentrieren },
  { titel: "Hochziehen", text: "Aus dem Klumpen wird ein Becher", Bild: Hochziehen },
  { titel: "Brennen", text: "Ich glasiere und brenne für dich", Bild: Brennen },
];

export function Schritte() {
  return (
    <ol className="schritte">
      {SCHRITTE.map(({ titel, text, Bild }, i) => (
        <li key={titel}>
          <div className="schritt-bild"><Bild /></div>
          <span className="schritt-nr">{i + 1}</span>
          <strong>{titel}</strong>
          <span>{text}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Glasurrand: oben die Farbe des vorherigen Abschnitts, darunter ein Streifen Glasur in `glasur`,
 * der in den nächsten Abschnitt (Hintergrund `farbe`) tropft.
 */
export function Glasurkante({ farbe = "#fbf8f3", oben = "#f4eee6", glasur = "#d9c3ab" }: { farbe?: string; oben?: string; glasur?: string }) {
  const d = "M0 0 L0 26 C 60 30, 100 24, 140 28 C 156 30, 158 50, 170 50 C 182 50, 182 30, 230 28 C 310 24, 370 32, 430 28 C 452 26, 454 62, 468 62 C 482 62, 480 30, 530 27 C 610 23, 670 32, 730 28 C 762 26, 772 44, 784 44 C 796 44, 798 28, 850 27 C 930 25, 990 32, 1046 28 C 1068 26, 1072 58, 1086 58 C 1100 58, 1098 30, 1140 27 C 1170 25, 1186 27, 1200 26 L1200 0 Z";
  return (
    <svg className="glasurkante" viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true">
      <rect width="1200" height="80" fill={farbe} />
      <path d={d} fill={glasur} />
      <g fill={glasur}>
        <ellipse className="tropfen-lang t1" cx="468" cy="58" rx="6" ry="6" />
        <ellipse className="tropfen-lang t2" cx="1086" cy="54" rx="6" ry="6" />
      </g>
      <rect width="1200" height="10" fill={oben} />
    </svg>
  );
}
