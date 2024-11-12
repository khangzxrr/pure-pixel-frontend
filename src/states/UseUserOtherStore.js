import { create } from "zustand";

const UseUserOtherStore = create((set) => ({
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

  // Clear the active item
  setHoveredItem: (itemId) => set({ hoveredItem: itemId }),
  clearHoveredItem: () => set({ hoveredItem: null }),
  isForSaleChecked: true,
  setIsForSaleChecked: (value) => set({ isForSaleChecked: value }),

  nameUserOther: "",
  setNameUserOther: (value) => set({ nameUserOther: value }),

  userOtherId: null,
  setUserOtherId: (value) => set({ userOtherId: value }),
}));

export default UseUserOtherStore;
