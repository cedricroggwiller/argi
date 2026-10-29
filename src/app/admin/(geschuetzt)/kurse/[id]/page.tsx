import Link from "next/link";
import { notFound } from "next/navigation";
import { kursNachId } from "@/lib/kurse";
import { KursFormular } from "../kursformular";

export const dynamic = "force-dynamic";

export default async function KursBearbeiten(props: PageProps<"/admin/kurse/[id]">) {
  const id = Number((await props.params).id);
  const sp = await props.searchParams;
  const k = Number.isInteger(id) ? await kursNachId(id) : null;
  if (!k) notFound();
  return (
    <>
      <p><Link href="/admin/kurse">← Kursarten</Link></p>
      <h1>{k.title}</h1>
      {sp.fehler && <p className="fehler" role="alert">Bitte Titel, Preis, Plätze und Dauer prüfen.</p>}
      <p className="small muted">Änderungen an Preis und Plätzen gelten für neue Termine; bestehende Termine behalten ihre Werte.</p>
      <KursFormular k={k} />
    </>
  );
}
