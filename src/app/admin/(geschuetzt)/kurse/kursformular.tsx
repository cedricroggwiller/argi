import type { Kurs } from "@/lib/kurse";
import { kursSpeichern } from "../../aktionen";

const BILDER = [
  ["/bilder/drehscheibe.jpg", "Drehscheibe"],
  ["/bilder/becher-gestapelt.jpg", "Gestapelte Becher"],
  ["/bilder/vase-kobalt.jpg", "Blaue Vase"],
  ["/bilder/becher-hand.jpg", "Becher in der Hand"],
  ["/bilder/tasse-lavendel.jpg", "Tasse im Lavendel"],
];

export function KursFormular({ k }: { k?: Kurs }) {
  return (
    <form action={kursSpeichern} className="karte form" style={{ maxWidth: 720 }}>
      {k && <input type="hidden" name="id" value={k.id} />}
      <label className="feld">Titel<input name="title" required minLength={2} maxLength={120} defaultValue={k?.title} placeholder="Drehscheibe für Einsteiger" /></label>
      <label className="feld">Kurzbeschreibung (Terminliste)<input name="teaser" maxLength={200} defaultValue={k?.teaser} placeholder="Becher und Schalen drehen" /></label>
      <label className="feld">Beschreibung (Kursseite; Absätze mit Leerzeile trennen)<textarea name="description" rows={6} maxLength={5000} defaultValue={k?.description} /></label>
      <label className="feld">Inbegriffen<input name="includes" maxLength={300} defaultValue={k?.includes} placeholder="Ton, Glasur, Brand und ein Getränk aus dem Kafi" /></label>
      <div className="raster">
        <label className="feld">Preis pro Person (CHF)<input name="preis" required inputMode="decimal" defaultValue={k ? String(k.price_cents / 100) : ""} /></label>
        <label className="feld">Plätze<input type="number" name="plaetze" required min={1} max={40} defaultValue={k?.capacity ?? 6} /></label>
        <label className="feld">Dauer (Minuten)<input type="number" name="dauer" required min={15} max={720} step={15} defaultValue={k?.duration_min ?? 180} /></label>
        <label className="feld">Reihenfolge<input type="number" name="sort" defaultValue={k?.sort ?? 0} /></label>
      </div>
      <label className="feld">Bild
        <select name="bild" defaultValue={k?.image ?? BILDER[0][0]}>
          {BILDER.map(([p, n]) => <option key={p} value={p}>{n}</option>)}
        </select>
      </label>
      <label className="check"><input type="checkbox" name="active" defaultChecked={k ? k.active : true} /> <span>Aktiv (auf der Website sichtbar)</span></label>
      <button className="btn btn-dark" type="submit">{k ? "Speichern" : "Kursart anlegen"}</button>
    </form>
  );
}
