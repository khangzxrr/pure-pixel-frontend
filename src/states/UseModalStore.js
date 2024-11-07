import create from "zustand";
import { devtools } from "zustand/middleware";

const useModalStore = create(
  devtools((set) => ({
    isUpdatePhotoModal: false,
    isUpdateOpenMapModal: false,
    selectedUpdatePhoto: {},

    setIsUpdatePhotoModal: (value) => set({ isUpdatePhotoModal: value }),
    setIsUpdateOpenMapModal: (value) => set({ isUpdateOpenMapModal: value }),

    setSelectedPhoto: (photo) => set({ selectedUpdatePhoto: photo }),
    updateSelectedUpdatePhotoField: (field, value) =>
      set((state) => ({
        selectedUpdatePhoto: {
          ...state.selectedUpdatePhoto,
          [field]: value,
        },
      })),
  }))
);

export default useModalStore;
