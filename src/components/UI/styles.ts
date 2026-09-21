/**
 * Interaction styles shared by every primitive, so focus, motion and disabled behaviour are
 * identical across the app. Pass a different ring offset when the control sits on a surface
 * other than the page background.
 */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-app";

export const focusRingInset =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0";

export const interactive = "transition-colors duration-150 motion-reduce:transition-none";

export const disabled = "disabled:cursor-not-allowed disabled:bg-surface-panel disabled:text-ink-disabled";
