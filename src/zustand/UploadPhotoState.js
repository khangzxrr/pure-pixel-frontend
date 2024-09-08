import { create } from "zustand";

const initialPhotoList = [];

const useUploadPhotoStore = create((set) => ({
  isUploading: false,
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {}, // Initialize with the first element
  photoDetails: {},
  photoExtraOption: {},
  deleteImageById: (id) =>
    set((state) => {
      const updatedPhotoList = state.photoList.filter(
        (image) => image.id !== id,
      );
      const isDeletedSelected = state.selectedPhoto.id === id;
      return {
        photoList: updatedPhotoList,
        selectedPhoto: isDeletedSelected
          ? updatedPhotoList[0] || {}
          : state.selectedPhoto,
      };
    }),
  addSingleImage: (photo) =>
    set((state) => ({
      photoList: [
        ...state.photoList,
        {
          ...photo,
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
