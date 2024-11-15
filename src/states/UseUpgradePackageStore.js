// UseFireworkStore.js
import { create } from "zustand";

const useUpgradePackageStore = create((set) => ({
  isUpgraded: false, // Default to false
  setIsUpgraded: (value) => set({ isUpgraded: value }),
}));

export default useUpgradePackageStore;
