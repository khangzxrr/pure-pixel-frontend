import { create } from "zustand";

type NameParam = { name: string; param: string };

type MyPhotoFilterState = {
  inputValue: string;
  setInputValue: (value: string) => void;

  searchResult: string;
  setSearchResult: (result: string) => void;

  filterByPhotoDate: NameParam;
  setFilterByPhotoDate: (name: string, param: string) => void;

  filterByUpVote: NameParam;
  setFilterByUpVote: (name: string, param: string) => void;
  isWatermarkChecked: boolean;
  setIsWatermarkChecked: (value: boolean) => void;
  isForSaleChecked: boolean;
  setIsForSaleChecked: (value: boolean) => void;
  isBanned: boolean;
  setIsBanned: (value: boolean) => void;
};

const UseMyPhotoFilter = create<MyPhotoFilterState>()((set) => ({
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
  isBanned: false,
  setIsBanned: (value) => set({ isBanned: value }),
}));

export default UseMyPhotoFilter;
