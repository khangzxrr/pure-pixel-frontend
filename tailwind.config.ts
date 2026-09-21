import aspectRatio from "@tailwindcss/aspect-ratio";
import type { Config } from "tailwindcss";
import scrollbar from "tailwind-scrollbar";

import {
  fontFamilySans,
  layout,
  palette,
  radii,
  shadows,
} from "./src/theme/tokens";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // semantic colours only: bg-surface-card, text-ink-muted, border-stroke-subtle, bg-accent …
      colors: palette,
      fontFamily: {
        sans: fontFamilySans,
      },
      // the type ramp; components use these instead of text-[13px] and friends
      fontSize: {
        meta: ["12px", { lineHeight: "16px", fontWeight: "400" }],
        secondary: ["13px", { lineHeight: "20px", fontWeight: "400" }],
        body: ["14px", { lineHeight: "22px", fontWeight: "400" }],
        "card-title": ["16px", { lineHeight: "24px", fontWeight: "600" }],
        "section-title": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "page-title": ["28px", { lineHeight: "36px", fontWeight: "600" }],
        hero: ["40px", { lineHeight: "48px", fontWeight: "700" }],
      },
      borderRadius: radii,
      boxShadow: shadows,
      maxWidth: {
        content: `${layout.contentMaxWidth}px`,
      },
      spacing: {
        sidebar: `${layout.sidebarWidth}px`,
        topbar: `${layout.topbarHeight}px`,
        "topbar-mobile": `${layout.topbarHeightMobile}px`,
      },
    },
  },
  plugins: [aspectRatio, scrollbar],
} satisfies Config;
