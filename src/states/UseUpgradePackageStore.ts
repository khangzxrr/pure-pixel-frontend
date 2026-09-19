// UseUpgradePackageStore.ts
import { create } from "zustand";

type UpgradePackageState = {
  isUpgraded: boolean;
  setIsUpgraded: (value: boolean) => void;
};

const useUpgradePackageStore = create<UpgradePackageState>()((set) => ({
  isUpgraded: false, // Default to false
  setIsUpgraded: (value) => set({ isUpgraded: value }),
}));

export default useUpgradePackageStore;
