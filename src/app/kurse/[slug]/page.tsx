import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Fuss, Kopf, TerminZeile } from "../../teile";
import { kursNachSlug, termineVonKurs } from "@/lib/kurse";
import { chf } from "@/lib/zeit";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: PageProps<"/kurse/[slug]">): Promise<Metadata> {
  const k = await kursNachSlug((await props.params).slug);
  return k ? { title: k.title, description: k.teaser || undefined } : {};
}

function dauer(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} Stunden`;
}

export default async function KursSeite(props: PageProps<"/kurse/[slug]">) {
  const k = await kursNachSlug((await props.params).slug);
  if (!k || !k.active) notFound();
  const termine = await termineVonKurs(k.id);

  return (
    <>
      <Kopf />
      <main className="wrap seite">
        <div className="split" style={{ alignItems: "flex-start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <span className="eyebrow">Kurs</span>
            <h1>{k.title}</h1>
            {k.teaser && <p className="lead" style={{ fontSize: 19 }}>{k.teaser}</p>}
            <dl className="zeilen">
              <dt>Dauer</dt><dd>{dauer(k.duration_min)}</dd>
              <dt>Preis</dt><dd>{chf(k.price_cents)} pro Person</dd>
              <dt>Gruppe</dt><dd>höchstens {k.capacity} Personen</dd>
              <dt>Ort</dt><dd>{SITE.ort.name}, {SITE.ort.zusatz}, {SITE.ort.strasse}, Baden</dd>
              {k.includes && (<><dt>Inbegriffen</dt><dd>{k.includes}</dd></>)}
            </dl>
            {k.description && (
              <div className="text">
                {k.description.split(/\n{2,}/).map((p, i) => <p key={i}>{p}</p>)}
              </div>
            )}
          </div>
          <div className="bild-rund">
            <Image src={k.image} alt={k.title} fill sizes="(max-width: 900px) 100vw, 560px" className="cover" />
          </div>
        </div>

        <h2 className="h2" style={{ margin: "64px 0 24px", fontSize: 40 }}>Termine</h2>
        {termine.length === 0 ? (
          <p className="leer">Für diesen Kurs ist gerade kein Termin ausgeschrieben.</p>
        ) : (
          <div className="termine">{termine.map((t) => <TerminZeile key={t.id} t={t} />)}</div>
        )}
      </main>
      <Fuss />
    </>
  );
}
