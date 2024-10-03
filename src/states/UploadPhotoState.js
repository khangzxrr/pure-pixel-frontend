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
      return state.photoList.some((photo) => photo.uid === uid);
    },

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
          (photo) => photo.uid === selectedPhoto,
        );
        const nextIndex = (currentIndex + 1) % photoList.length;
        return { selectedPhoto: photoList[nextIndex].uid };
      }),

    setPreviousSelectedPhoto: () =>
      set((state) => {
        const { photoList, selectedPhoto } = state;
        if (photoList.length === 0) return;

        const currentIndex = photoList.findIndex(
          (photo) => photo.uid === selectedPhoto,
        );
        const previousIndex =
          (currentIndex - 1 + photoList.length) % photoList.length;
        return { selectedPhoto: photoList[previousIndex].uid };
      }),
  })),
);

export default useUploadPhotoStore;
