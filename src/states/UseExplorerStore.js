import { create } from "zustand";

const UseExplorerStore = create((set) => ({
  activeItem: null,

  setActiveItem: (id) => set({ activeItem: id }),
}));

export default UseExplorerStore;
