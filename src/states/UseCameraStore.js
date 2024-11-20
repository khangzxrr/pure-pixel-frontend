import { create } from "zustand";

const UseCameraStore = create((set) => ({
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

  nameBrandCamera: "",
  setNameBrandCamera: (name) => set({ nameBrandCamera: name }),

  brandCamera: "", // Trạng thái cho nhãn hiệu camera
  nameCamera: "", // Trạng thái cho tên camera
  setNameCamera: (brand, name) => set({ brandCamera: brand, nameCamera: name }),

  listTopBrandCamera: [],
  setListTopBrandCamera: (list) => set({ listTopBrandCamera: list }),

  listTopCameraByBrand: [],
  setListTopCameraByBrand: (list) => set({ listTopCameraByBrand: list }),
}));

export default UseCameraStore;
