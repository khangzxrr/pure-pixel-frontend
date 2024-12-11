import { create } from "zustand";
import { devtools } from "zustand/middleware"; // Import `devtools` middleware for debugging

const useBeforeRouteDetailPhoto = create(
  devtools((set) => ({
    beforeRoute: "",
    setBeforeRoute: (route) => set({ beforeRoute: route }),
  }))
);
export default useBeforeRouteDetailPhoto;
