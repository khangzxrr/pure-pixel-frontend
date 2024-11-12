import { create } from "zustand";

const UseSellingPhotoStore = create((set) => ({
  isForSellingPhoto: true,
  setIsForSellingPhoto: (value) => set({ isForSellingPhoto: value }),

  namePhotographer: "",
  setNamePhotographer: (name) => set({ namePhotographer: name }),

  inputValue: "",
  searchResult: "", // Lưu trữ kết quả tìm kiếm
  setSearchResult: (result) => set({ searchResult: result }),
  setInputValue: (value) => set({ inputValue: value }),
}));

export default UseSellingPhotoStore;
