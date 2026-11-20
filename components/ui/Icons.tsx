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
    case "facebook":
      return (<svg width={20} height={20} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z" /></svg>);
    default:
      return null;
  }
};
