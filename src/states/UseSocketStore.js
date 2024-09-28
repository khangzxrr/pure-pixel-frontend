import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useSocketStore = create(devtools((set, get) => ({})));

export default useSocketStore;
