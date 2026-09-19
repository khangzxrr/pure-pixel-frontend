import type { ReactNode } from "react";
import { create } from "zustand";

type BlogState = {
  isSidebarOpen: boolean;
  activeItem: string | null;
  activeIcon: ReactNode;
  activeTitle: string | null;
  // only present after setActiveItem
  activeQuote?: ReactNode;
  hoveredItem: string | null;
  toggleSidebar: () => void;
  setActiveItem: (
    id: string,
    title: string,
    icon: ReactNode,
    quote: ReactNode
  ) => void;
  setHoveredItem: (itemId: string | null) => void;
  clearHoveredItem: () => void;
};

const UseBlogStore = create<BlogState>()((set) => ({
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

export default UseBlogStore;
