import { create } from "zustand";
import { devtools } from "zustand/middleware"; // Import `devtools` middleware for debugging

type BeforeRouteDetailPhotoState = {
  beforeRoute: string;
  setBeforeRoute: (route: string) => void;
};

const useBeforeRouteDetailPhoto = create<BeforeRouteDetailPhotoState>()(
  devtools((set) => ({
    beforeRoute: "",
    setBeforeRoute: (route) => set({ beforeRoute: route }),
  }))
);
export default useBeforeRouteDetailPhoto;
