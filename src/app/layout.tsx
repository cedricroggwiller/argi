import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Karla } from "next/font/google";
import "./globals.css";
import { appUrl } from "@/lib/site";

const serif = Cormorant_Garamond({ subsets: ["latin"], weight: ["500", "600"], style: ["normal", "italic"], variable: "--font-serif" });
const sans = Karla({ subsets: ["latin"], weight: ["400", "500", "700"], variable: "--font-sans" });

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: { default: "argi – Töpferkurse in Baden", template: "%s · argi" },
  description: "Töpferkurse an der Drehscheibe und von Hand in der Werkstatt im Keller des Kafi Hoi Zäme, Baden. Ohne Vorwissen, in kleinen Gruppen.",
  openGraph: { images: ["/bilder/drehscheibe.jpg"], locale: "de_CH", type: "website" },
};

export const viewport: Viewport = { themeColor: "#f4eee6" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de-CH" className={`${serif.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
