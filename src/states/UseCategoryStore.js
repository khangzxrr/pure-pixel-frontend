import { create } from "zustand";
const UseCategoryStore = create((set) => ({
  selectedPhotoCategory: { name: "", param: "" },
  filterByPhotoDate: { name: "", param: "" },
  filterByUpVote: { name: "", param: "" },
  setSelectedPhotoCategory: (name, param) =>
    set({ selectedPhotoCategory: { name, param } }),
  setFilterByPhotoDate: (name, param) =>
    set({ filterByPhotoDate: { name, param } }),
  setFilterByUpVote: (name, param) => set({ filterByUpVote: { name, param } }),
}));

export default UseCategoryStore;
