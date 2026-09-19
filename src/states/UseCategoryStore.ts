import { create } from "zustand";

type NameParam = { name: string; param: string };

type SearchCategory = NameParam & { quote: string; icon: string };

type CategoryState = {
  // the explore category list selects by name only
  selectedPhotoCategory: { name: string; param?: string };
  filterByPhotoDate: NameParam;
  filterByUpVote: NameParam;
  isWatermarkChecked: boolean;
  isForSaleChecked: boolean;

  inputValue: string;
  searchResult: string;
  searchByPhotoTitle: string;
  searchCategory: SearchCategory;

  searchByTags: string[];
  setSearchByTags: (tag: string) => void;

  setSelectedPhotoCategory: (name: string, param?: string) => void;
  setFilterByPhotoDate: (name: string, param: string) => void;
  setFilterByUpVote: (name: string, param: string) => void;
  setIsWatermarkChecked: (value: boolean) => void;
  setIsForSaleChecked: (value: boolean) => void;
  setInputValue: (value: string) => void;
  setSearchResult: (result: string) => void;
  setSearchByPhotoTitle: (result: string) => void;
  setSearchCategory: (
    name: string,
    param: string,
    quote: string,
    icon: string
  ) => void;
  filterByIsFollowed: NameParam;
  setFilterByIsFollowed: (name: string, param: string) => void;
};

const UseCategoryStore = create<CategoryState>()((set) => ({
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
