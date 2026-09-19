import type { ReactNode } from "react";
import { create } from "zustand";

type InspirationState = {
  isSidebarOpen: boolean;
  // menu ids are strings in some sidebars and numbers in others (explore)
  activeItem: string | number | null;
  activeIcon: ReactNode;
  activeTitle: string | null;
  // only present after setActiveItem
  activeQuote?: ReactNode;
  hoveredItem: string | null;
  toggleSidebar: () => void;
  setActiveItem: (
    id: string | number,
    title: string,
    icon: ReactNode,
    quote: ReactNode
  ) => void;
  setHoveredItem: (itemId: string | null) => void;
  clearHoveredItem: () => void;
};

// Store to manage sidebar state and active item
const UseInspirationStore = create<InspirationState>()((set) => ({
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
}));

export default UseInspirationStore;
