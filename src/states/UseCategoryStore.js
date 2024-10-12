import { create } from "zustand";
const UseCategoryStore = create((set) => ({
  selectedPhotoCategory: { name: "", param: "" },
  setSelectedPhotoCategory: (name, param) =>
    set({ selectedPhotoCategory: { name, param } }),
}));

export default UseCategoryStore;
