import type { Metadata } from "next";
import { anmelden } from "../aktionen";

export const metadata: Metadata = { title: "Anmelden", robots: { index: false } };

export default async function Login(props: PageProps<"/admin/login">) {
  const sp = await props.searchParams;
  const fehler = sp.fehler === "1" ? "Das Passwort stimmt nicht." : sp.fehler === "gesperrt" ? "Zu viele Versuche. Bitte in 15 Minuten nochmals." : null;
  return (
    <main className="narrow seite" style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: 44 }}>argi · Verwaltung</h1>
      <form action={anmelden} className="karte form">
        {fehler && <p className="fehler" role="alert">{fehler}</p>}
        <label className="feld">Passwort
          <input type="password" name="passwort" required autoComplete="current-password" autoFocus />
        </label>
        <button className="btn btn-dark" type="submit">Anmelden</button>
      </form>
    </main>
  );
}
