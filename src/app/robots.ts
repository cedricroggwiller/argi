import type { MetadataRoute } from "next";
import { appUrl } from "@/lib/site";

// Kontaktangaben kommen zur Laufzeit aus der Umgebung.
export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/buchen/", "/buchung/", "/api/"] }],
    sitemap: `${appUrl()}/sitemap.xml`,
  };
}
