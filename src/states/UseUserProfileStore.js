import { create } from "zustand";

const UseUserProfileStore = create((set) => ({
  isSidebarOpen: false,
  activeItem: null,
  activeIcon: null,
  activeTitle: null,
  hoveredItem: null,
  // Toggle sidebar open/close
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Set the active item
  setActiveItem: (id, title, icon, quote) =>
    set(() => ({
      activeItem: id,
      activeTitle: title,
      activeIcon: icon,
      activeQuote: quote,
    })),
  setActiveTitle: (title) => set(() => ({ activeTitle: title })),
  // Clear the active item
  setHoveredItem: (itemId) => set({ hoveredItem: itemId }),
  clearHoveredItem: () => set({ hoveredItem: null }),
}));
export default UseUserProfileStore;
