// states/useSidebarStore.js
import { create } from "zustand";

const UseSidebarStore = create((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setIsSidebarOpen: (value) => set({ isSidebarOpen: value }),
  activeLink: null, // Thêm state activeLink
  setActiveLink: (link) => set({ activeLink: link }),
}));

export default UseSidebarStore;
