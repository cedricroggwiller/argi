import { Fuss, Kopf } from "./teile";

export function Textseite({ titel, eyebrow, children }: { titel: string; eyebrow?: string; children: React.ReactNode }) {
  return (
    <>
      <Kopf />
      <main className="narrow seite text">
        {eyebrow && <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>}
        <h1>{titel}</h1>
        {children}
      </main>
      <Fuss />
    </>
  );
}
