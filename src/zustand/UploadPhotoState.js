import create from "zustand";
import { ImageList } from "../fakejson/ImageList";

const useUploadPhotoStore = create((set) => ({
  currentStep: 1,
  photoList: ImageList,
  photoDetails: {},
  photoExtraOption: {},
  setCurrentStep: (step) => set({ currentStep: step }),
  setPhotoDetails: (details) => set({ photoDetails: details }),
  setPhotoExtraOption: (option) => set({ photoExtraOption: option }),
  addAllImages: (images) =>
    set((state) => ({ photoList: [...state.photoList, ...images] })),
  deleteImageById: (id) =>
    set((state) => ({
      photoList: state.photoList.filter((image) => image.id !== id),
    })),
  addSingleImage: (image) =>
    set((state) => ({ photoList: [...state.photoList, image] })),
}));

export default useUploadPhotoStore;
