import { create } from "zustand";

const UseSellingPhotoStore = create((set) => ({
  isForSellingPhoto: true,
  setIsForSellingPhoto: (value) => set({ isForSellingPhoto: value }),
}));

export default UseSellingPhotoStore;
