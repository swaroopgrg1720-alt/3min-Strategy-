import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/lib/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.title, template: "%s | 3MIN SCALP" },
  description: site.description,
  keywords: site.keywords,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
    images: [{ url: "/social-profile.svg", width: 400, height: 400, alt: "3MIN SCALP" }],
  },
  twitter: { card: "summary", title: site.title, description: site.description, images: ["/social-profile.svg"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#080D12", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/logo-mark.svg` },
    {
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Windows (MetaTrader 5)",
      softwareVersion: site.version,
      description: site.description,
      offers: [
        { "@type": "Offer", name: "Monthly", price: "29", priceCurrency: "USD" },
        { "@type": "Offer", name: "Lifetime", price: "199", priceCurrency: "USD" },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <CookieConsent />
      </body>
    </html>
  );
}
