// states/useSidebarStore.ts
import { create } from "zustand";

type SidebarState = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setIsSidebarOpen: (value: boolean) => void;
  // sidebar item ids: strings in most menus, numbers in explore
  activeLink: string | number | null;
  setActiveLink: (link: string | number | null) => void;
};

const UseSidebarStore = create<SidebarState>()((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
  activeLink: null, // Thêm state activeLink
  setActiveLink: (link) => set({ activeLink: link }),
}));

export default UseSidebarStore;
