/**
 * The single source of truth for PurePixel's dark theme.
 *
 * Both `tailwind.config.ts` and `src/theme/antdTheme.ts` read from this file, so a colour,
 * radius or shadow is defined exactly once and Tailwind utilities and antd components stay
 * in sync. Components must use the generated utilities (`bg-surface-card`, `text-ink-muted`,
 * `border-stroke-subtle`, …) instead of literal hex values.
 */

type ColorGroup = Record<string, string>;

/**
 * Surfaces are ordered from furthest to closest to the viewer: app → panel → card → elevated.
 * Elevation is carried by background and border, never by a default shadow.
 */
export const palette = {
  surface: {
    /** page background */
    app: "#111315",
    /** sidebar and recessed panels */
    panel: "#171A1E",
    /** cards and form controls */
    card: "#1D2126",
    /** menus, dialogs, popovers */
    elevated: "#252B32",
    /** neutral hover for rows and ghost controls */
    hover: "#2D353E",
    /** scrim behind actions laid over a photograph */
    scrim: "#111315E6",
    /** modal backdrop */
    overlay: "#000000B8",
  },
  stroke: {
    /** decorative card boundary */
    DEFAULT: "#46515E",
    /** quiet divider between sections and cards */
    subtle: "#303740",
    /** essential control boundary: inputs, outlined buttons */
    strong: "#758394",
  },
  ink: {
    primary: "#F3F4F6",
    secondary: "#BAC2CC",
    /** metadata and placeholders; 5.94:1 on surface.card */
    muted: "#929EAC",
    /** disabled text only, never used for readable content */
    disabled: "#65717F",
  },
  accent: {
    DEFAULT: "#F3B86A",
    hover: "#FFCD8A",
    active: "#DCA155",
    /** text drawn on a filled accent background; 9.95:1 */
    contrast: "#17191D",
    /** selected rows, chips and options */
    subtle: "#30281E",
    "subtle-hover": "#3B3022",
    border: "#80613B",
  },
  success: { DEFAULT: "#83D6A4", bg: "#1B3025", border: "#385E46" },
  warning: { DEFAULT: "#F2CF66", bg: "#342D1B", border: "#6B5930" },
  danger: { DEFAULT: "#FF929B", bg: "#371F25", border: "#75414C" },
  info: { DEFAULT: "#91BCFA", bg: "#1E2B40", border: "#3E5F89" },
} satisfies Record<string, ColorGroup>;

/** Be Vietnam Pro is self-hosted from `public/fonts` and covers Vietnamese diacritics. */
export const fontFamilySans = [
  "Be Vietnam Pro",
  "Segoe UI",
  "Roboto",
  "system-ui",
  "sans-serif",
];

export const fontStack = fontFamilySans
  .map((family) => (family.includes(" ") ? `"${family}"` : family))
  .join(", ");

export const shadows = {
  "ui-sm": "0 1px 2px rgb(0 0 0 / 0.20)",
  popover: "0 8px 24px rgb(0 0 0 / 0.32)",
  dialog: "0 24px 64px rgb(0 0 0 / 0.48)",
} satisfies Record<string, string>;

export const radii = {
  "ui-sm": "4px",
  control: "8px",
  card: "12px",
  dialog: "16px",
} satisfies Record<string, string>;

/** Shell measurements shared by the layout and the components that offset against it. */
export const layout = {
  sidebarWidth: 224,
  topbarHeight: 64,
  topbarHeightMobile: 56,
  contentMaxWidth: 1440,
} as const;

export type GridDensity = "compact" | "cozy" | "large";

export const gridDensityOrder: GridDensity[] = ["compact", "cozy", "large"];

export const gridDensityLabels: Record<GridDensity, string> = {
  compact: "Gọn",
  cozy: "Vừa",
  large: "Lớn",
};

/** Gap in pixels between photo grid items, per density. */
export const gridDensityGap: Record<GridDensity, number> = {
  compact: 12,
  cozy: 16,
  large: 20,
};

/**
 * Photo grid columns keyed on the width available to the grid, not the viewport: the sidebar
 * must not be able to turn a nominal four column grid into four unusably narrow cards.
 * Each entry is [maxWidth, columns]; the last entry catches everything wider.
 */
export const gridDensityColumns: Record<GridDensity, [number, number][]> = {
  compact: [
    [480, 1],
    [720, 2],
    [960, 3],
    [1200, 4],
    [1440, 5],
    [Infinity, 6],
  ],
  cozy: [
    [480, 1],
    [720, 2],
    [960, 2],
    [1200, 3],
    [1440, 4],
    [Infinity, 4],
  ],
  large: [
    [480, 1],
    [720, 1],
    [960, 2],
    [1200, 2],
    [1440, 3],
    [Infinity, 3],
  ],
};

export function columnsForWidth(width: number, density: GridDensity): number {
  const table = gridDensityColumns[density];
  for (const [maxWidth, columns] of table) {
    if (width < maxWidth) return columns;
  }
  return table[table.length - 1][1];
}
