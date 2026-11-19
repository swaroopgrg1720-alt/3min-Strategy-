"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { analyticsIds, CONSENT_KEY, hasTracking, type ConsentState } from "@/lib/analytics";

function load(): ConsentState | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    return raw ? (JSON.parse(raw) as ConsentState) : null;
  } catch {
    return null;
  }
}

/** Renders nothing and loads nothing unless tracking IDs are configured. Scripts load only after consent. */
export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [ready, setReady] = useState(false);
  const [manage, setManage] = useState(false);
  const [prefs, setPrefs] = useState<ConsentState>({ analytics: false, marketing: false });

  useEffect(() => {
    setConsent(load());
    setReady(true);
  }, []);

  if (!hasTracking) return null;

  const save = (c: ConsentState) => {
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(c));
    } catch {
      /* storage unavailable: consent applies for this page view only */
    }
    setConsent(c);
  };

  return (
    <>
      {consent?.analytics && analyticsIds.ga && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${analyticsIds.ga}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsIds.ga}');`}
          </Script>
        </>
      )}
      {consent?.marketing && analyticsIds.metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analyticsIds.metaPixel}');fbq('track','PageView');`}
        </Script>
      )}
      {consent?.marketing && analyticsIds.tiktokPixel && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._t=ttq._t||{};ttq._t[e]=+new Date;var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=n+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${analyticsIds.tiktokPixel}');ttq.page()}(window,document,'ttq');`}
        </Script>
      )}

      {ready && !consent && (
        <div role="dialog" aria-label="Cookie preferences" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-line bg-bg2 p-5 shadow-2xl">
          <p className="text-sm text-muted">
            We use optional cookies for analytics and marketing only if you allow them. See our{" "}
            <a href="/privacy" className="text-accent underline">Privacy Policy</a>.
          </p>
          {manage && (
            <div className="mt-4 space-y-3 text-sm">
              <label className="flex items-center gap-3 text-muted"><input type="checkbox" checked disabled /> Necessary (always on)</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} /> Analytics</label>
              <label className="flex items-center gap-3"><input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} /> Marketing</label>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <button className="btn btn-primary !py-2" onClick={() => save({ analytics: true, marketing: true })}>Accept</button>
            <button className="btn btn-ghost !py-2" onClick={() => save({ analytics: false, marketing: false })}>Reject</button>
            {manage ? (
              <button className="btn btn-ghost !py-2" onClick={() => save(prefs)}>Save preferences</button>
            ) : (
              <button className="btn btn-ghost !py-2" onClick={() => setManage(true)}>Manage Preferences</button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
