import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initPhotoIdHashMap = {};
const initUiHashMap = {};
const initPhotoArray = [];

const useUploadPhotoStore = create(
  devtools((set, get) => ({
    photoIdHashmap: initPhotoIdHashMap,
    uidHashmap: initUiHashMap,
    photoArray: initPhotoArray,
    selectedPhoto: null,
    isUpdatingPhotos: false,
    isOpenDraftModal: false,

    getPhotoByUid: (uid) => {
      const index = get().uidHashmap[uid];
      return get().photoArray[index];
    },

    setSelectedPhotoById: (id) =>
      set((state) => ({
        selectedPhoto: state.photoArray[state.photoIdHashmap[id]],
      })),

    updateSelectedPhotoProperty: (key, value) => {
      set((state) => {
        state.selectedPhoto[key] = value;
        return {
          selectedPhoto: state.selectedPhoto,
        };
      });
    },
    updatePhotoPropertyByUid: (uid, key, value) => {
      set((state) => {
        const index = state.uidHashmap[uid];
        if (index !== undefined) {
          state.photoArray[index][key] = value;
          state.selectedPhoto[key] = value;
        }
        return {
          photoArray: state.photoArray,
          selectedPhoto: state.selectedPhoto,
        };
      });
    },
    addPhoto: (uid, id, payload) =>
      set((state) => {
        const index = state.photoArray.length;

        state.photoIdHashmap[id] = index;
        state.uidHashmap[uid] = index;

        state.photoArray.push(payload);

        return {
          photoArray: state.photoArray,
          photoIdHashmap: state.photoIdHashmap,
          uidHashmap: state.uidHashmap,
        };
      }),

    removePhotoById: (id) => {
      set((state) => {
        const index = state.photoIdHashmap[id];

        const uid = state.photoArray[index].file.uid;

        state.photoArray.splice(index, 1);

        delete state.photoIdHashmap[id];
        delete state.uidHashmap[uid];

        return {
          photoIdHashmap: state.photoIdHashmap,
          uidHashmap: state.uidHashmap,
          photoArray: state.photoArray,
        };
      });
    },

    removePhotoByUid: (uid) =>
      set((state) => {
        const index = state.uidHashmap[uid];

        const id = state.photoArray[index].signedUpload.photoId;

        delete state.photoIdHashmap[id];
        delete state.uidHashmap[uid];

        return {
          photoIdHashmap: state.photoIdHashmap,
          uidHashmap: state.uidHashmap,
          photoArray: state.photoArray,
        };
      }),

    clearState: () => {
      set({
        photoIdHashmap: {},
        uidHashmap: {},
        photoArray: [],
        selectedPhoto: null,
        isUpdatingPhotos: false,
        isOpenDraftModal: false,
      });
    },

    setIsOpenDraftModal: (status) => {
      set({ isOpenDraftModal: status });
    },

    isPhotoExistByUid: (uid) => {
      const state = useUploadPhotoStore.getState();
      return state.photoArray.some((photo) => photo.uid === uid);
    },

    deleteImageById: (id) =>
      set((state) => {
        const updatedPhotoArray = state.photoArray.filter(
          (image) => image.id !== id
        );
        const isDeletedSelected = state.selectedPhoto.id === id;

        return {
          photoArray: updatedPhotoArray,
          selectedPhoto: isDeletedSelected
            ? updatedPhotoArray[0] || {}
            : state.selectedPhoto,
        };
      }),

    toggleWatermark: (status) =>
      set((state) => {
        const photoArray = state.photoArray.map((photo) => ({
          ...photo,
          watermark: status,
        }));

        return { photoArray };
      }),

    setNextSelectedPhoto: () =>
      set((state) => {
        const { photoArray, selectedPhoto } = state;
        if (photoArray.length === 0) return;

        const currentIndex = photoArray.findIndex(
          (photo) => photo.file.uid === selectedPhoto.file.uid
        );
        const nextIndex = (currentIndex + 1) % photoArray.length;
        return { selectedPhoto: photoArray[nextIndex] };
      }),

    setPreviousSelectedPhoto: () =>
      set((state) => {
        const { photoArray, selectedPhoto } = state;
        if (photoArray.length === 0) return;

        const currentIndex = photoArray.findIndex(
          (photo) => photo.file.uid === selectedPhoto.file.uid
        );
        const previousIndex =
          (currentIndex - 1 + photoArray.length) % photoArray.length;
        console.log(
          "setPrevious",
          currentIndex,
          previousIndex,
          photoArray[previousIndex]
        );

        return { selectedPhoto: photoArray[previousIndex] };
      }),
  }))
);

export default useUploadPhotoStore;
