// UseFireworkStore.ts
import { create } from "zustand";

type FireworkState = {
  isFiring: boolean;
  startFireworks: () => void;
  stopFireworks: () => void;
};

const useFireworkStore = create<FireworkState>()((set) => ({
  isFiring: false, // Default to false
  startFireworks: () => set({ isFiring: true }),
  stopFireworks: () => set({ isFiring: false }),
}));

export default useFireworkStore;
