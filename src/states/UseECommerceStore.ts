import { create } from "zustand";

type ECommerceState = {
  toDate: Date;
  fromDate: Date;
  setFromDateState: (value: Date) => void;
  setToDateState: (value: Date) => void;
};

const UseECommerceStore = create<ECommerceState>()((set) => ({
  toDate: new Date(),
  fromDate: new Date(2024, 8, 1),
  setFromDateState: (value) => set({ fromDate: value }),
  setToDateState: (value) => set({ toDate: value }),
}));

export default UseECommerceStore;
