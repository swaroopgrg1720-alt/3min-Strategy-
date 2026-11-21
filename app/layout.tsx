import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { site } from "@/lib/config/site";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { SiteChrome } from "@/components/layout/SiteChrome";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const sans = Figtree({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

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
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "3MIN SCALP" }],
  },
  twitter: { card: "summary", title: site.title, description: site.description, images: ["/logo.png"] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0F1512", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: site.name, url: site.url, logo: `${site.url}/logo.png` },
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
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="font-sans">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SiteChrome header={<Navbar />} footer={<Footer />}>{children}</SiteChrome>
        <ChatWidget />
        <CookieConsent />
      </body>
    </html>
  );
}
