import { create } from "zustand";

const initialPhotoList = [];

const useUploadPhotoStore = create((set) => ({
  photoList: initialPhotoList,
  selectedPhoto: initialPhotoList[0] || {},
  photoExtraOption: {},
  isUpdatingPhotos: false,
  isOpenDraftModal: false,

  clearState: () => {
    set({
      photoList: [],
      selectedPhoto: {},
    });
  },

  setIsUpdating: (isUpdating) => {
    set({ isUpdatingPhotos: isUpdating });
  },

  setIsOpenDraftModal: (status) => {
    set({ isOpenDraftModal: status });
  },

  addSingleImage: (photo) =>
    set((state) => ({
      photoList: [
        ...(Array.isArray(state.photoList) ? state.photoList : []),
        {
          ...photo,
          isWatermark: true,
          currentStep: 1,
        },
      ],
    })),

  isPhotoExistByUid: (uid) => {
    const state = useUploadPhotoStore.getState();
    return state.photoList.some((photo) => photo.uid === uid);
  },

  updatePhotoByUid: (uid, newPhoto) =>
    set((state) => {
      console.log("Updating photo by UID:", uid);
      return {
        photoList: state.photoList.map((photo) => {
          if (photo.uid === uid) {
            console.log("Updating photo name:", photo.name);
            return {
              ...photo,
              ...newPhoto,
              title: photo.name,
              currentStep: photo.currentStep,
            };
          }
          return photo;
        }),
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

  removePhotoByUid: (uid) =>
    set((state) => {
      const updatedPhotoList = state.photoList.filter(
        (photo) => photo.uid !== uid
      );

      const isDeletedSelected = state.selectedPhoto.uid === uid;

      const newSelectedPhoto = isDeletedSelected
        ? updatedPhotoList[0] || {}
        : state.selectedPhoto;

      return {
        photoList: updatedPhotoList,
        selectedPhoto: newSelectedPhoto,
      };
    }),

  setSelectedPhoto: (photo) =>
    set(() => {
      console.log("Setting selected photo:", photo);
      return { selectedPhoto: photo };
    }),

  setCurrentStep: (id, step) =>
    set((state) => {
      const photoList = [...state.photoList];
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
        const updatedPhoto = {
          ...photoList[photoIndex],
          [field]: value,
        };

        photoList[photoIndex] = updatedPhoto;

        const selectedPhoto =
          state.selectedPhoto.id === id ? updatedPhoto : state.selectedPhoto;

        return { photoList, selectedPhoto };
      }
    }),

  updateFieldByUid: (uid, field, value) =>
    set((state) => {
      console.log("Updating field by UID:", uid, field, value);

      const photoList = [...state.photoList];
      const photoIndex = photoList.findIndex((image) => image.uid === uid);

      if (photoIndex !== -1) {
        const updatedPhoto = {
          ...photoList[photoIndex],
          [field]: value,
        };

        photoList[photoIndex] = updatedPhoto;

        return { photoList };
      }
    }),

  toggleWatermark: (status) =>
    set((state) => {
      const photoList = state.photoList.map((photo) => ({
        ...photo,
        isWatermark: status,
      }));

      const selectedPhoto = {
        ...state.selectedPhoto,
        isWatermark: status,
      };

      return { photoList, selectedPhoto };
    }),
  setNextSelectedPhoto: () =>
    set((state) => {
      const { photoList, selectedPhoto } = state;
      if (photoList.length === 0) return;

      const currentIndex = photoList.findIndex(
        (photo) => photo.uid === selectedPhoto.uid
      );
      const nextIndex = (currentIndex + 1) % photoList.length;
      return { selectedPhoto: photoList[nextIndex] };
    }),
  setPreviousSelectedPhoto: () =>
    set((state) => {
      const { photoList, selectedPhoto } = state;
      if (photoList.length === 0) return;

      const currentIndex = photoList.findIndex(
        (photo) => photo.uid === selectedPhoto.uid
      );
      const previousIndex =
        (currentIndex - 1 + photoList.length) % photoList.length;
      return { selectedPhoto: photoList[previousIndex] };
    }),
}));

export default useUploadPhotoStore;
