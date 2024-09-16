import { create } from "zustand";

const initialPhotoList = [];

const useUploadPhotoStore = create((set) => ({
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {}, // Initialize with the first element
  photoExtraOption: {},
  isUpdatingPhotos: false,

  clearState: () => {
    set({
      photoList: [],
      selectedPhoto: {},
    });
  },

  setIsUpdating: (isUpdating) => {
    set({ isUpdatingPhotos: isUpdating });
  },
  addSingleImage: (photo) =>
    set((state) => ({
      photoList: [
        ...(Array.isArray(state.photoList) ? state.photoList : []),
        {
          ...photo,
          currentStep: 1, // Add currentStep to the new image
        },
      ],
    })),
  isPhotoExistByUid: (uid) => {
    const state = useUploadPhotoStore.getState();
    return state.photoList.some((photo) => photo.uid === uid);
  },
  updatePhotoByUid: (uid, newPhoto) =>
    set((state) => {
      console.log("Update photo by uid:", uid);
      return {
        photoList: state.photoList.map((photo) =>
          photo.uid === uid
            ? { ...photo, ...newPhoto, currentStep: photo.currentStep }
            : photo
        ),
      };
    }),
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

  setSelectedPhoto: (photo) =>
    set((state) => {
      console.log("Set selected photo:", photo);
      return { selectedPhoto: photo };
    }),
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

      if (photoIndex === -1) {
        return;
      }

      const photo = photoList[photoIndex];
      photo[field] = value;

      const selectedPhoto =
        state.selectedPhoto.id === id ? photo : state.selectedPhoto;

      return { photoList, selectedPhoto };
    }),
}));

export default useUploadPhotoStore;
