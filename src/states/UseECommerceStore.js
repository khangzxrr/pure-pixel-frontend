import { create } from "zustand";

const UseECommerceStore = create((set) => ({
  toDate: new Date(),
  fromDate: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
  setFromDateState: (value) => set({ fromDate: value }),
  setToDateState: (value) => set({ toDate: value }),
}));

export default UseECommerceStore;
