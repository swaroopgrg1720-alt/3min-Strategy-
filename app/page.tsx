import Link from "next/link";
import { Hero } from "@/components/sections/Hero";
import { CardGrid, HowItWorks, MarketCards, overviewCards } from "@/components/sections/Cards";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Pricing } from "@/components/sections/Pricing";
import { SocialProof, Testimonials, FollowSection } from "@/components/sections/Proof";
import { CTA } from "@/components/sections/CTA";

export default function Home() {
  return (
    <>
      <Hero />
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Overview" title="One EA. Multiple Markets." text="3MIN SCALP is an automated trading solution designed for MetaTrader 5 users who want to explore systematic trading across multiple instruments from one Expert Advisor." />
          <CardGrid items={overviewCards} />
        </div>
      </section>
      <section className="section border-y border-line bg-bg2/40">
        <div className="container-x">
          <SectionHeading eyebrow="Markets" title="Three Markets. One Trading System." />
          <MarketCards />
        </div>
      </section>
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="How it works" title="From purchase to MT5 in four steps" />
          <HowItWorks />
          <div className="mt-8"><Link href="/pricing" className="btn btn-primary">Get Started</Link></div>
        </div>
      </section>
      <section className="section border-y border-line bg-bg2/40">
        <div className="container-x">
          <SectionHeading eyebrow="Transparency" title="Trust is earned, not claimed" text="We do not publish unverified results. Verification and reviews will appear here when real data exists." />
          <SocialProof />
          <Testimonials />
        </div>
      </section>
      <section className="section">
        <div className="container-x">
          <SectionHeading eyebrow="Pricing" title="Simple licensing" />
          <Pricing />
        </div>
      </section>
      <section className="section border-t border-line bg-bg2/40">
        <div className="container-x">
          <SectionHeading eyebrow="Community" title="Follow 3MIN SCALP" />
          <FollowSection />
        </div>
      </section>
      <CTA />
    </>
  );
}
