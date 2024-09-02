import create from "zustand";

const useUploadPhotoStore = create((set) => ({
  currentStep: 1,
  photoDetails: {},
  photoExtraOption: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  setPhotoDetails: (details) => set({ photoDetails: details }),
  setPhotoExtraOption: (option) => set({ photoExtraOption: option }),
}));

export default useUploadPhotoStore;
