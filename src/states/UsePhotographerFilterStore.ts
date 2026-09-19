import { create } from "zustand";

type PhotographerFilterState = {
  inputValue: string;
  searchResult: string;
  setInputValue: (value: string) => void;
  setSearchResult: (result: string) => void;

  filterByVote: { name: string; param: string };
  setFilterByVote: (name: string, param: string) => void;

  namePhotographer: string;
  setNamePhotographer: (name: string) => void;
};

const UsePhotographerFilterStore = create<PhotographerFilterState>()((set) => ({
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
