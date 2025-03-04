import { create } from "zustand";

const UsePhotographerFilterStore = create((set) => ({
  inputValue: "",
  searchResult: "",
  setInputValue: (value) => set({ inputValue: value }),
  setSearchResult: (result) => set({ searchResult: result }),

  filterByVote: { name: "", param: "" },
  setFilterByVote: (name, param) => set({ filterByVote: { name, param } }),

  namePhotographer: "",
  setNamePhotographer: (name) => set({ namePhotographer: name }),
}));

export default UsePhotographerFilterStore;
