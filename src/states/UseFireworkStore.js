// UseFireworkStore.js
import { create } from "zustand";

const useFireworkStore = create((set) => ({
  isFiring: false, // Default to false
  startFireworks: () => set({ isFiring: true }),
  stopFireworks: () => set({ isFiring: false }),
}));

export default useFireworkStore;
