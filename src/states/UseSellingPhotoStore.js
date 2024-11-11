import { create } from "zustand";

const UseSellingPhotoStore = create((set) => ({
  isForSellingPhoto: true,
  setIsForSellingPhoto: (value) => set({ isForSellingPhoto: value }),

  namePhotographer: "",
  setNamePhotographer: (name) => set({ namePhotographer: name }),
}));

export default UseSellingPhotoStore;
