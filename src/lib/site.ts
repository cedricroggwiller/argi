/** Feste Angaben zur Marke und zum Ort. Texte in [eckigen Klammern] liefert Argi noch. */
export const SITE = {
  name: "argi",
  claim: "Töpferkurse in Baden",
  ort: {
    name: "Kafi Hoi Zäme",
    zusatz: "Werkstatt im Keller",
    strasse: "Rathausgasse 8",
    plzOrt: "5400 Baden",
    karte: "https://www.google.com/maps/search/?api=1&query=Rathausgasse+8%2C+5400+Baden",
    web: "https://www.xn--kafihoizme-x5a.ch/",
  },
  instagram: "https://www.instagram.com/alessia_rossi_p/",
  kontaktEmail: process.env.ADMIN_EMAIL || "[E-Mail]",
  /** Bis so viele Tage vor dem Kurs ist eine Absage kostenlos. */
  stornoTage: 7,
};

export const ORT_ZEILE = `${SITE.ort.name} (${SITE.ort.zusatz}), ${SITE.ort.strasse}, ${SITE.ort.plzOrt}`;

export function appUrl(): string {
  return (process.env.APP_URL || "http://localhost:3100").replace(/\/$/, "");
}
