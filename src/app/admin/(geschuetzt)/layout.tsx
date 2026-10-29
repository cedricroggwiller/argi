import Link from "next/link";
import type { Metadata } from "next";
import { pflichtAdmin } from "@/lib/admin";
import { abmelden } from "../aktionen";

export const metadata: Metadata = { title: "Verwaltung", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await pflichtAdmin();
  return (
    <div className="admin">
      <header className="admin-kopf">
        <div className="wrap">
          <Link href="/admin" style={{ fontFamily: "var(--serif)", fontSize: 26, fontWeight: 600 }}>argi · Verwaltung</Link>
          <nav aria-label="Verwaltung">
            <Link href="/admin">Termine</Link>
            <Link href="/admin/termine/neu">Neuer Termin</Link>
            <Link href="/admin/kurse">Kursarten</Link>
            <Link href="/" target="_blank">Website</Link>
            <form action={abmelden} className="inline"><button className="link-btn" style={{ color: "var(--ground)" }}>Abmelden</button></form>
          </nav>
        </div>
      </header>
      <main className="wrap">{children}</main>
    </div>
  );
}
