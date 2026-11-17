import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...p,
});

export const IconChart = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M3 3v18h18" /><path d="M7 15l4-4 3 3 5-6" /></svg>);
export const IconLayers = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3l9 5-9 5-9-5 9-5z" /><path d="M3 13l9 5 9-5" /></svg>);
export const IconBolt = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></svg>);
export const IconBox = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" /><path d="M3 8l9 5 9-5M12 13v8" /></svg>);
export const IconKey = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="8" cy="15" r="4" /><path d="M11 12l9-9M16 7l3 3" /></svg>);
export const IconBook = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2V5z" /><path d="M4 19a2 2 0 012-2h13" /></svg>);
export const IconSupport = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3.5" /><path d="M5.5 5.5l3.5 3.5M15 15l3.5 3.5M18.5 5.5L15 9M9 15l-3.5 3.5" /></svg>);
export const IconShield = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></svg>);
export const IconCheck = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M5 12l5 5 9-10" /></svg>);
export const IconMenu = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M4 7h16M4 12h16M4 17h16" /></svg>);
export const IconClose = (p: SVGProps<SVGSVGElement>) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>);

export const SocialIcon = ({ id }: { id: string }) => {
  const p = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (id) {
    case "instagram":
      return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" /></svg>);
    case "tiktok":
      return (<svg {...p}><path d="M14 3v11.5a3.5 3.5 0 11-3.5-3.5" /><path d="M14 3c.4 2.4 2 4 4.5 4.2" /></svg>);
    case "youtube":
      return (<svg {...p}><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5l4 2.5-4 2.5v-5z" fill="currentColor" /></svg>);
    case "telegram":
      return (<svg {...p}><path d="M21 4L3 11l6 2.2L11 20l3-4.5 4.5 3.3L21 4z" /><path d="M9 13.2L21 4" /></svg>);
    default:
      return (<svg {...p}><path d="M4 4l16 16M20 4L4 20" /></svg>);
  }
};
