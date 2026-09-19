import type { ReactNode } from "react";
import { create } from "zustand";
import type { Schema } from "../apis/types";

// the brand list screens read maker.id, which MakerDto does not declare
export type TopBrandCamera = Omit<Schema<"MakerWithUserCountDto">, "maker"> & {
  maker: Schema<"MakerDto"> & { id: string };
};

type CameraState = {
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

  nameBrandCamera: string;
  setNameBrandCamera: (name: string) => void;

  brandCamera: string;
  nameCamera: string;
  setNameCamera: (brand: string, name: string) => void;

  listTopBrandCamera: TopBrandCamera[];
  setListTopBrandCamera: (list: TopBrandCamera[]) => void;

  listTopCameraByBrand: Schema<"CameraDto">[];
  setListTopCameraByBrand: (list: Schema<"CameraDto">[]) => void;

  idCamera: string | null;
  setIdCamera: (id: string | null) => void;
};

const UseCameraStore = create<CameraState>()((set) => ({
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

  idCamera: null,
  setIdCamera: (id) => set({ idCamera: id }),
}));

export default UseCameraStore;
