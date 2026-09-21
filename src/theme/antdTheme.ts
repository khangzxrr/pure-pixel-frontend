import { theme, type ThemeConfig } from "antd";

import { fontStack, palette as p, radii, shadows } from "./tokens";

/**
 * The one antd theme for the whole app, applied by the single `ConfigProvider` in `App.jsx`.
 *
 * Components must not create their own `ConfigProvider`: anything that needs a different look
 * belongs in this file, so antd internals and Tailwind utilities keep reading the same tokens.
 * Styling `.ant-*` selectors globally (as `index.css` used to) is likewise replaced by the
 * component overrides below.
 */
export const antdTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    fontFamily: fontStack,
    fontSize: 14,
    fontSizeSM: 12,
    lineHeight: 22 / 14,
    lineHeightSM: 16 / 12,
    fontWeightStrong: 600,

    fontSizeHeading1: 40,
    lineHeightHeading1: 48 / 40,
    fontSizeHeading2: 28,
    lineHeightHeading2: 36 / 28,
    fontSizeHeading3: 20,
    lineHeightHeading3: 28 / 20,
    fontSizeHeading4: 16,
    lineHeightHeading4: 24 / 16,
    fontSizeHeading5: 16,
    lineHeightHeading5: 24 / 16,

    colorBgBase: p.surface.app,
    colorBgLayout: p.surface.app,
    colorBgContainer: p.surface.card,
    colorBgElevated: p.surface.elevated,
    colorBgMask: p.surface.overlay,
    colorBgTextHover: p.surface.hover,
    colorBgTextActive: p.surface.elevated,
    colorBgContainerDisabled: p.surface.panel,

    colorText: p.ink.primary,
    colorTextHeading: p.ink.primary,
    colorTextSecondary: p.ink.secondary,
    colorTextTertiary: p.ink.muted,
    colorTextQuaternary: p.ink.disabled,
    colorTextDisabled: p.ink.disabled,
    colorTextPlaceholder: p.ink.muted,
    colorIcon: p.ink.muted,
    colorIconHover: p.ink.primary,
    // labels drawn on filled accent surfaces; Tooltip opts out below
    colorTextLightSolid: p.accent.contrast,

    colorBorder: p.stroke.strong,
    colorBorderSecondary: p.stroke.subtle,
    colorSplit: p.stroke.subtle,

    colorPrimary: p.accent.DEFAULT,
    colorPrimaryHover: p.accent.hover,
    colorPrimaryActive: p.accent.active,
    colorPrimaryBg: p.accent.subtle,
    colorPrimaryBgHover: p.accent["subtle-hover"],
    colorPrimaryBorder: p.accent.border,
    colorPrimaryBorderHover: p.accent.DEFAULT,
    colorPrimaryText: p.accent.DEFAULT,
    colorPrimaryTextHover: p.accent.hover,
    colorPrimaryTextActive: p.accent.active,
    colorLink: p.accent.DEFAULT,
    colorLinkHover: p.accent.hover,
    colorLinkActive: p.accent.active,

    colorSuccess: p.success.DEFAULT,
    colorSuccessBg: p.success.bg,
    colorSuccessBorder: p.success.border,
    colorWarning: p.warning.DEFAULT,
    colorWarningBg: p.warning.bg,
    colorWarningBorder: p.warning.border,
    colorError: p.danger.DEFAULT,
    colorErrorBg: p.danger.bg,
    colorErrorBorder: p.danger.border,
    colorInfo: p.info.DEFAULT,
    colorInfoBg: p.info.bg,
    colorInfoBorder: p.info.border,

    controlItemBgHover: p.surface.hover,
    controlItemBgActive: p.accent.subtle,
    controlItemBgActiveHover: p.accent["subtle-hover"],
    controlOutline: p.accent.DEFAULT,
    controlOutlineWidth: 2,

    controlHeightSM: 32,
    controlHeight: 40,
    controlHeightLG: 48,
    borderRadiusXS: 4,
    borderRadiusSM: 4,
    borderRadius: 8,
    borderRadiusLG: 12,

    boxShadowTertiary: shadows["ui-sm"],
    boxShadowSecondary: shadows.popover,
    boxShadow: shadows.dialog,
  },
  components: {
    Layout: {
      bodyBg: p.surface.app,
      siderBg: p.surface.panel,
      headerBg: p.surface.app,
      headerHeight: 64,
    },
    Button: {
      primaryColor: p.accent.contrast,
      defaultBg: p.surface.elevated,
      defaultColor: p.ink.primary,
      defaultBorderColor: p.stroke.strong,
      defaultHoverBg: p.surface.hover,
      defaultHoverColor: p.ink.primary,
      defaultHoverBorderColor: p.stroke.strong,
      primaryShadow: "none",
      defaultShadow: "none",
      dangerShadow: "none",
    },
    Card: {
      colorBorderSecondary: p.stroke.DEFAULT,
      borderRadiusLG: 12,
    },
    Modal: {
      contentBg: p.surface.elevated,
      headerBg: p.surface.elevated,
      footerBg: p.surface.elevated,
      titleColor: p.ink.primary,
      borderRadiusLG: 16,
    },
    Select: {
      optionSelectedBg: p.accent.subtle,
      optionSelectedColor: p.accent.DEFAULT,
      optionActiveBg: p.surface.hover,
    },
    Table: {
      headerBg: p.surface.elevated,
      headerColor: p.ink.secondary,
      rowHoverBg: p.surface.hover,
      rowSelectedBg: p.accent.subtle,
      borderColor: p.stroke.subtle,
    },
    Pagination: {
      itemSize: 32,
      itemSizeSM: 32,
      itemActiveBg: p.accent.subtle,
    },
    Tooltip: {
      colorBgSpotlight: p.surface.elevated,
      // the global light-solid token is the dark label used on accent fills; tooltips need ink
      colorTextLightSolid: p.ink.primary,
      borderRadius: Number.parseInt(radii.control, 10),
    },
    Typography: {
      titleMarginTop: 0,
      titleMarginBottom: 0,
    },
  },
};
