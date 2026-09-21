import { useEffect, useRef, useState } from "react";

import { columnsForWidth, type GridDensity } from "../theme/tokens";

/**
 * Column count for a photo grid, measured on the grid container rather than the viewport so the
 * sidebar cannot squeeze a nominal four-column grid. Falls back to the window width where
 * ResizeObserver is unavailable (jsdom, very old browsers).
 */
export function usePhotoGridColumns(density: GridDensity) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const measured =
    width ??
    (typeof window === "undefined"
      ? 1200
      : Math.min(window.innerWidth, 1440));

  return { ref, columns: columnsForWidth(measured, density) };
}
