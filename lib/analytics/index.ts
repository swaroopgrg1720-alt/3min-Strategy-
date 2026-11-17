/** IDs come from env vars. Nothing loads without a configured ID AND user consent. */
export const analyticsIds = {
  ga: process.env.NEXT_PUBLIC_ANALYTICS_ID || "",
  metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
  tiktokPixel: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "",
};

export const hasTracking = !!(analyticsIds.ga || analyticsIds.metaPixel || analyticsIds.tiktokPixel);

export const CONSENT_KEY = "3ms-cookie-consent";
export interface ConsentState {
  analytics: boolean;
  marketing: boolean;
}
