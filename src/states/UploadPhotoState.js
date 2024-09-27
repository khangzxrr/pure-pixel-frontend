import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initialPhotoList = [];

const useUploadPhotoStore = create(
  devtools((set) => ({
    photoList: initialPhotoList,
    selectedPhoto: initialPhotoList[0] ? initialPhotoList[0].uid : "",
    photoExtraOption: {},
    isUpdatingPhotos: false,
    isOpenDraftModal: false,

    clearState: () => {
      set({
        photoList: [],
        selectedPhoto: "",
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
          },
        ],
      })),

    isPhotoExistByUid: (uid) => {
      const state = useUploadPhotoStore.getState();
      return state.photoList.some((photo) => photo.uid === uid);
    },

    updatePhotoByUid: (uid, newPhoto) =>
      set((state) => {
        return {
          photoList: state.photoList.map((photo) => {
            if (photo.uid === uid) {
              return {
                ...photo,
                ...newPhoto,
                title: photo.name,
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

    setSelectedPhoto: (uid) =>
      set((state) => ({
        ...state,
        selectedPhoto: uid,
      })),

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

          return { photoList };
        }
      }),

    updateFieldByUid: (uid, field, value) =>
      set((state) => {
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
          watermark: status,
        }));

        return { photoList };
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
  }))
);

export default useUploadPhotoStore;
