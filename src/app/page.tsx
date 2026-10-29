import Image from "next/image";
import Link from "next/link";
import { Fuss, Kopf, TerminZeile } from "./teile";
import { kommendeTermine } from "@/lib/kurse";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function Start() {
  const termine = await kommendeTermine(12);

  return (
    <>
      <Kopf />

      <header className="wrap hero">
        <div className="hero-text">
          <div className="eyebrow">Töpferkurse in Baden</div>
          <h1>Ton in den Händen.<br /><em>Kaffee daneben.</em></h1>
          <p className="lead">
            Drei Stunden an der Drehscheibe oder am Tisch, in der Werkstatt im Keller des Kafi Hoi Zäme in der
            Badener Altstadt. Ohne Vorwissen. Deine Stücke brenne und glasiere ich für dich.
          </p>
          <div className="knoepfe">
            <Link href="#kurse" className="btn btn-accent">Nächste Termine</Link>
            <Link href="/gutscheine" className="btn">Gutschein schenken</Link>
          </div>
        </div>
        <div className="hero-bilder">
          <div className="gross">
            <Image src="/bilder/drehscheibe.jpg" alt="Drehscheibe mit frisch gedrehtem Becher in der Werkstatt" fill priority sizes="(max-width: 900px) 60vw, 380px" className="cover" />
          </div>
          <div className="stapel">
            <div className="klein">
              <Image src="/bilder/becher-gestapelt.jpg" alt="Zwei gestapelte Becher mit gesprenkelter weisser Glasur" fill sizes="(max-width: 900px) 40vw, 250px" className="cover" />
            </div>
            <div className="klein">
              <Image src="/bilder/vase-kobalt.jpg" alt="Kleine Vase mit kobaltblauer Glasur" fill sizes="(max-width: 900px) 40vw, 250px" className="cover" />
            </div>
          </div>
        </div>
      </header>

      <section id="kurse" className="band">
        <div className="narrow">
          <div className="section-head">
            <h2>Nächste Kurse</h2>
            <span className="muted small">Kleine Gruppen · ohne Vorwissen</span>
          </div>
          {termine.length === 0 ? (
            <p className="leer">
              Gerade sind keine Termine ausgeschrieben. Neue Kurse kündige ich auf{" "}
              <a href={SITE.instagram} rel="noopener">Instagram</a> an.
            </p>
          ) : (
            <div className="termine">
              {termine.map((t) => <TerminZeile key={t.id} t={t} />)}
            </div>
          )}
        </div>
      </section>

      <section id="ueber" className="wrap" style={{ padding: "96px 24px" }}>
        <div className="split">
          <div className="bild-rund">
            <Image src="/bilder/tasse-lavendel.jpg" alt="Gesprenkelte Tasse vor Lavendel in der Morgensonne" fill sizes="(max-width: 900px) 100vw, 560px" className="cover" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2 className="h2">Hallo, ich bin Argi.</h2>
            <p className="lead" style={{ maxWidth: 560 }}>
              [Kurzer Text von Argi: wie sie zum Ton gekommen ist, was ihr an den Kursen wichtig ist, was man am Ende
              mit nach Hause nimmt.]
            </p>
            <div className="fakten">
              <div><span className="zahl">klein</span><span className="small muted">Gruppen, damit Zeit für alle bleibt</span></div>
              <div><span className="zahl">gebrannt</span><span className="small muted">und glasiert holst du dein Stück später ab</span></div>
              <div><span className="zahl">Kafi</span><span className="small muted">oben gibt’s Kaffee und glutenfreies Gebäck</span></div>
            </div>
          </div>
        </div>
        <div className="galerie" style={{ marginTop: 56 }}>
          <div><Image src="/bilder/becher-hand.jpg" alt="Weisser Becher in der Hand vor roter Holzwand" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/vase-kobalt.jpg" alt="Kobaltblaue Vase" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/becher-gestapelt.jpg" alt="Gestapelte gesprenkelte Becher" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/drehscheibe.jpg" alt="Arbeitsplatz an der Drehscheibe" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
        </div>
        <p style={{ marginTop: 20 }}><a href={SITE.instagram} rel="noopener">Mehr auf Instagram</a></p>
      </section>

      <section id="ort" className="dark">
        <div className="wrap split">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <span className="eyebrow" style={{ color: "var(--sand)" }}>Der Ort</span>
            <h2 className="h2">Kafi Hoi Zäme</h2>
            <p style={{ margin: 0, color: "#e6dacb" }}>
              {SITE.ort.strasse}, {SITE.ort.plzOrt}. Mitten in der Altstadt, ein paar Minuten vom Bahnhof. Getöpfert
              wird in der Werkstatt im Keller; oben im Kafi gibt es Kaffee und glutenfreies Gebäck aus der eigenen Küche.
            </p>
            <p style={{ margin: 0, display: "flex", gap: 20, flexWrap: "wrap" }}>
              <a href={SITE.ort.karte} rel="noopener">Anfahrt in Google Maps</a>
              <a href={SITE.ort.web} rel="noopener">kafihoizäme.ch</a>
            </p>
          </div>
          <div className="platzhalter"><span>Foto: Werkstatt im Keller (folgt)</span></div>
        </div>
      </section>

      <section className="narrow" style={{ padding: "96px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20, textAlign: "center" }}>
        <h2 className="h2">Ein Abend am Ton, verschenkt.</h2>
        <p className="lead" style={{ maxWidth: 560 }}>Gutschein für einen Kurs oder einen freien Betrag.</p>
        <Link href="/gutscheine" className="btn btn-accent">Gutschein anfragen</Link>
      </section>

      <Fuss />
    </>
  );
}
