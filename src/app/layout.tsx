import type { Metadata, Viewport } from "next";
// Schriften liegen im Projekt (fontsource): der Bau braucht keinen Zugriff auf Google Fonts.
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-500-italic.css";
import "@fontsource/cormorant-garamond/latin-600.css";
import "@fontsource-variable/karla/wght.css";
import "./globals.css";
import { appUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "argi – Töpferkurse in Baden", template: "%s · argi" },
  description: "Töpferkurse an der Drehscheibe und von Hand in der Werkstatt im Keller des Kafi Hoi Zäme, Baden. Ohne Vorwissen, in kleinen Gruppen.",
  openGraph: { images: ["/bilder/drehscheibe.jpg"], locale: "de_CH", type: "website" },
};

export const viewport: Viewport = { themeColor: "#f4eee6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH">
      <body>{children}</body>
    </html>
  );
}
