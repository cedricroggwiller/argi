import type { MetadataRoute } from "next";
import { aktiveKurse } from "@/lib/kurse";
import { appUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = appUrl();
  const fest = ["", "/gutscheine", "/gruppen", "/faq", "/impressum", "/datenschutz", "/agb"].map((p) => ({ url: `${base}${p}` }));
  const kurse = (await aktiveKurse()).map((k) => ({ url: `${base}/kurse/${k.slug}` }));
  return [...fest, ...kurse];
}
