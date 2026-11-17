import type { MetadataRoute } from "next";
import { site } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/dashboard", "/admin", "/api", "/login"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
