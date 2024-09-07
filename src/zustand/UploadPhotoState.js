import create from "zustand";
import { ImageList } from "../fakejson/ImageList";

const initialPhotoList = ImageList.map((image) => ({
  ...image,
  currentStep: 1, // Add currentStep to each photo
}));

const useUploadPhotoStore = create((set) => ({
  isUploading: false,
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {}, // Initialize with the first element
  photoDetails: {},
  photoExtraOption: {},
  deleteImageById: (id) =>
    set((state) => {
      const updatedPhotoList = state.photoList.filter(
        (image) => image.id !== id
      );
      const isDeletedSelected = state.selectedPhoto.id === id;
      return {
        photoList: updatedPhotoList,
        selectedPhoto: isDeletedSelected
          ? updatedPhotoList[0] || {}
          : state.selectedPhoto,
      };
    }),
  addSingleImage: () =>
    set((state) => ({
      photoList: [
        ...state.photoList,
        {
          id: state.photoList.length + 1,
          image: "https://picsum.photos/200/300",
          imageDetails: "",
          additionalDetails: "",
          type: "",
          tag: [],
          location: "",
          private: "",
          addWatermark: true,
          includeEXIF: true,
          camera: "Leica Q2",
          lens: "Summilux 28mm f/1.7 ASPH",
          focalLength: 28,
          shutterSpeed: "1/1000",
          aperture: 1.7,
          iso: 100,
          shootDate: "2023-01-01",
          currentStep: 1, // Add currentStep to the new image
        },
      ],
    })),
  setSelectedPhoto: (photo) => set({ selectedPhoto: photo }),
  setCurrentStep: (id, step) =>
    set((state) => {
      const photoList = [...state.photoList]; // Create a shallow copy of the array
      const photoIndex = photoList.findIndex((image) => image.id === id);

      if (photoIndex !== -1) {
        photoList[photoIndex] = { ...photoList[photoIndex], currentStep: step };
      }

      const selectedPhoto =
        state.selectedPhoto.id === id
          ? { ...state.selectedPhoto, currentStep: step }
          : state.selectedPhoto;

      return { photoList, selectedPhoto };
    }),
  updateField: (id, field, value) =>
    set((state) => {
      const photoList = [...state.photoList];
      const photoIndex = photoList.findIndex((image) => image.id === id);

      if (photoIndex !== -1) {
        photoList[photoIndex] = { ...photoList[photoIndex], [field]: value };
      }

      const selectedPhoto =
        state.selectedPhoto.id === id
          ? { ...state.selectedPhoto, [field]: value }
          : state.selectedPhoto;

      return { photoList, selectedPhoto };
    }),
  setIsUploading: (isUploading) => set({ isUploading }),
}));

export default useUploadPhotoStore;
