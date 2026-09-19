import { create } from "zustand";

type SellingPhotoState = {
  isForSellingPhoto: boolean;
  setIsForSellingPhoto: (value: boolean) => void;

  namePhotographer: string;
  setNamePhotographer: (name: string) => void;

  inputValue: string;
  searchResult: string;
  setSearchResult: (result: string) => void;
  setInputValue: (value: string) => void;

  page: number;
  setPage: (page: number) => void;

  searchByPhotoTitle: string;
  searchCategory: { name: string; param: string; quote: string; icon: string };
  setSearchByPhotoTitle: (result: string) => void;
  setSearchCategory: (
    name: string,
    param: string,
    quote: string,
    icon: string
  ) => void;
};

const UseSellingPhotoStore = create<SellingPhotoState>()((set) => ({
  isForSellingPhoto: true,
  setIsForSellingPhoto: (value) => set({ isForSellingPhoto: value }),

  namePhotographer: "",
  setNamePhotographer: (name) => set({ namePhotographer: name }),

  inputValue: "",
  searchResult: "", // Lưu trữ kết quả tìm kiếm
  setSearchResult: (result) => set({ searchResult: result }),
  setInputValue: (value) => set({ inputValue: value }),

  page: 1,
  setPage: (page) => set({ page }),

  searchByPhotoTitle: "",
  searchCategory: {
    name: "Tên ảnh",
    param: "photoName",
    quote: "ảnh",
    icon: "FaRegImage",
  },
  setSearchByPhotoTitle: (result) => set({ searchByPhotoTitle: result }),
  setSearchCategory: (name, param, quote, icon) =>
    set({ searchCategory: { name, param, quote, icon } }),
}));

export default UseSellingPhotoStore;
