import { create } from "zustand";
const UseCategoryStore = create((set) => ({
  selectedPhotoCategory: { name: "", param: "" },
  filterByPhotoDate: { name: "Mới nhất", param: "desc" },
  filterByUpVote: { name: "", param: "" },
  isWatermarkChecked: false,
  isForSaleChecked: false,

  inputValue: "", // Giá trị của input
  searchResult: "", // Lưu trữ kết quả tìm kiếm
  searchByPhotoTitle: "",
  searchCategory: {
    name: "Tên ảnh",
    param: "photoName",
    quote: "ảnh",
    icon: "FaRegImage",
  },

  searchByTags: [""],
  setSearchByTags: (tag) => set({ searchByTags: [tag] }),

  setSelectedPhotoCategory: (name, param) =>
    set({ selectedPhotoCategory: { name, param } }),
  setFilterByPhotoDate: (name, param) =>
    set({ filterByPhotoDate: { name, param } }),
  setFilterByUpVote: (name, param) => set({ filterByUpVote: { name, param } }),
  setIsWatermarkChecked: (value) => set({ isWatermarkChecked: value }),
  setIsForSaleChecked: (value) => set({ isForSaleChecked: value }),
  setInputValue: (value) => set({ inputValue: value }),
  setSearchResult: (result) => set({ searchResult: result }),
  setSearchByPhotoTitle: (result) => set({ searchByPhotoTitle: result }),
  setSearchCategory: (name, param, quote, icon) =>
    set({ searchCategory: { name, param, quote, icon } }),
  filterByIsFollowed: { name: "", param: "" },
  setFilterByIsFollowed: (name, param) =>
    set({ filterByIsFollowed: { name, param } }),
}));

export default UseCategoryStore;
