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
