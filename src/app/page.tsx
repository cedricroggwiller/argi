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

      <section id="anfangen" className="narrow anfangen">
        <span className="eyebrow">So fängst du an</span>
        <h2 className="h2">Wie fängt man eigentlich an zu töpfern?</h2>
        <p className="gross">Ganz ehrlich: mit schmutzigen Händen und einem Lachen.</p>
        <p>
          Am Anfang steht ein Klumpen Ton, kühl, weich und ein bisschen eigenwillig. Bevor er etwas werden darf, wird er
          geknetet. Das macht die Luftbläschen raus und bringt dich langsam an, im Keller, weg vom Handy, hin zu deinen Händen.
        </p>
        <p>
          Dann kommt der Moment, vor dem alle ein wenig Respekt haben: der Ton auf der Drehscheibe. Er dreht sich, er
          wackelt, er macht, was er will. Mit nassen Händen und ein bisschen Geduld bringst du ihn in die Mitte. Das nennt
          man zentrieren, und es ist das Wichtigste und das Schwierigste zugleich. Wenn es zum ersten Mal klappt und der Ton
          plötzlich ruhig unter deinen Händen läuft, ist das ein kleines Wunder. Versprochen.
        </p>
        <p>
          Danach öffnest du ihn mit dem Daumen, ziehst die Wand behutsam nach oben, und auf einmal steht da etwas, das
          aussieht wie ein Becher. Vielleicht ein bisschen schief. Vielleicht ein bisschen dick. Aber deiner.
        </p>
        <p>
          Und wenn etwas zusammenfällt? Dann knetest du es wieder zusammen und fängst neu an. Das gehört dazu, und ehrlich
          gesagt ist das der halbe Spass.
        </p>
        <p>
          Dein Stück darf danach in Ruhe trocknen. Ich brenne und glasiere es für dich, und ein paar Wochen später hältst du
          es in den Händen. Am schönsten ist es, wenn du zum ersten Mal deinen Kaffee daraus trinkst.
        </p>
        <p>
          Vorwissen brauchst du keines. Nur Kleider, die schmutzig werden dürfen, kurze Fingernägel und Lust, etwas
          auszuprobieren.
        </p>
        <p className="gruss">Ich freu mich auf dich!<br />Alessia</p>
        <Link href="#kurse" className="btn btn-accent" style={{ alignSelf: "flex-start" }}>Zu den Terminen</Link>
      </section>

      <section id="werkstatt" className="wrap" style={{ padding: "96px 24px" }}>
        <div className="section-head">
          <h2>Aus der Werkstatt</h2>
          <a href={SITE.instagram} rel="noopener" className="small">Mehr auf Instagram</a>
        </div>
        <div className="galerie galerie-5">
          <div className="hoch"><Image src="/bilder/tasse-lavendel.jpg" alt="Gesprenkelte Tasse vor Lavendel in der Morgensonne" fill sizes="(max-width: 600px) 100vw, 480px" className="cover" /></div>
          <div><Image src="/bilder/becher-hand.jpg" alt="Weisser Becher in der Hand vor roter Holzwand" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/vase-kobalt.jpg" alt="Kobaltblaue Vase" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/becher-gestapelt.jpg" alt="Gestapelte gesprenkelte Becher" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
          <div><Image src="/bilder/drehscheibe.jpg" alt="Arbeitsplatz an der Drehscheibe" fill sizes="(max-width: 600px) 50vw, 300px" className="cover" /></div>
        </div>
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
          <figure className="kafi-bilder">
            <div className="gross"><Image src="/bilder/kafi-schild.jpg" alt="Kreidetafel mit der Aufschrift Kafi Hoi Zäme und zwei Herzen" fill sizes="(max-width: 900px) 60vw, 340px" className="cover" /></div>
            <div><Image src="/bilder/kafi-espresso.jpg" alt="Siebträger an der Espressomaschine im Kafi" fill sizes="(max-width: 900px) 40vw, 220px" className="cover" /></div>
            <div><Image src="/bilder/kafi-mauer.jpg" alt="Pampasgras vor alter Steinmauer" fill sizes="(max-width: 900px) 40vw, 220px" className="cover" /></div>
            <figcaption>Fotos: Kafi Hoi Zäme</figcaption>
          </figure>
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
