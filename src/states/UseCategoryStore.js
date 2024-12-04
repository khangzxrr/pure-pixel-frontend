import { create } from "zustand";
const UseCategoryStore = create((set) => ({
  selectedPhotoCategory: { name: "", param: "" },
  filterByPhotoDate: { name: "", param: "" },
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

  searchByTags: [], // Mảng lưu trữ tags
  setSearchByTags: (value) => {
    // Kiểm tra nếu value là một mảng
    if (Array.isArray(value)) {
      set({ searchByTags: value });
    } else {
      console.error("searchByTags phải là một mảng.");
    }
  },
  addTag: (tag) =>
    set((state) => ({
      searchByTags: [...state.searchByTags, tag],
    })),
  removeTag: (tag) =>
    set((state) => ({
      searchByTags: state.searchByTags.filter((t) => t !== tag),
    })),

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
