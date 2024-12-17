import { create } from "zustand";

const UseECommerceStore = create((set) => ({
  toDate: new Date(),
  fromDate: new Date(2024, 8, 1),
  setFromDateState: (value) => set({ fromDate: value }),
  setToDateState: (value) => set({ toDate: value }),
}));

export default UseECommerceStore;
