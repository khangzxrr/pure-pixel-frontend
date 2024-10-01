import { create } from "zustand";

const UseServerSideStore = create((set) => ({
  activeLinkServer: null,
  setActiveLinkServer: (link) => set({ activeLinkServer: link }),
}));

export default UseServerSideStore;
