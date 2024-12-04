import { create } from "zustand";

const UseMyPhotoFilter = create((set) => ({
  inputValue: "",
  setInputValue: (value) => set({ inputValue: value }),

  searchResult: "",
  setSearchResult: (result) => set({ searchResult: result }),

  filterByPhotoDate: { name: "Mới nhất", param: "desc" },
  setFilterByPhotoDate: (name, param) =>
    set({ filterByPhotoDate: { name, param } }),

  filterByUpVote: { name: "", param: "" },
  setFilterByUpVote: (name, param) => set({ filterByUpVote: { name, param } }),
  isWatermarkChecked: false,
  setIsWatermarkChecked: (value) => set({ isWatermarkChecked: value }),
  isForSaleChecked: false,
  setIsForSaleChecked: (value) => set({ isForSaleChecked: value }),
}));

export default UseMyPhotoFilter;
