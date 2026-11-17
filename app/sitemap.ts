import type { MetadataRoute } from "next";
import { site } from "@/lib/config/site";

const routes = ["", "/features", "/markets", "/performance", "/pricing", "/documentation", "/faq", "/contact", "/checkout", "/changelog", "/terms", "/privacy", "/refund-policy", "/risk-disclosure"];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((r) => ({ url: `${site.url}${r}`, lastModified: new Date(), changeFrequency: "weekly", priority: r === "" ? 1 : 0.7 }));
}
