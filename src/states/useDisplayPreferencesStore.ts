import { create } from "zustand";
import { persist } from "zustand/middleware";

import { gridDensityOrder, type GridDensity } from "../theme/tokens";

type DisplayPreferencesState = {
  /** photo grid density, shared by the inspiration feed and the other photo lists */
  density: GridDensity;
  setDensity: (density: GridDensity) => void;
};

const isDensity = (value: unknown): value is GridDensity =>
  typeof value === "string" && (gridDensityOrder as string[]).includes(value);

/**
 * Display preferences survive reloads. Only presentation state belongs here — never filters,
 * because restoring a stale filter hides photos the user did not ask to hide.
 */
export const useDisplayPreferencesStore = create<DisplayPreferencesState>()(
  persist(
    (set) => ({
      density: "cozy",
      setDensity: (density) => set({ density }),
    }),
    {
      name: "purepixel.display-preferences",
      merge: (persisted, current) => {
        const saved = persisted as Partial<DisplayPreferencesState> | undefined;
        return {
          ...current,
          density: isDensity(saved?.density) ? saved.density : current.density,
        };
      },
    },
  ),
);
