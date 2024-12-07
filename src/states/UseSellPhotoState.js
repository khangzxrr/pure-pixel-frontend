import { create } from "zustand";
import { devtools } from "zustand/middleware";

const initPhotoIdHashMap = {};
const initUiHashMap = {};
const initPhotoArray = [];

const useSellPhotoStore = create(
  devtools((set, get) => ({
    photoIdHashmap: initPhotoIdHashMap,
    uidHashmap: initUiHashMap,
    photoArray: initPhotoArray,
    selectedPhoto: null,
    isUpdatingPhotos: false,
    isOpenDraftModal: false,
    isOpenMapModal: false,
    disableUpload: false,
    setDisableUpload: (status) => {
      set({ disableUpload: status });
    },
    getPhotoByUid: (uid) => {
      const index = get().uidHashmap[uid];
      return get().photoArray[index];
    },

    setSelectedPhotoByUid: (uid) =>
      set((state) => ({
        selectedPhoto: uid,
      })),

    updatePhotoPropertyByUid: (uid, key, value) => {
      set((state) => {
        const index = state.uidHashmap[uid];

        // Check if the index is valid
        if (index !== undefined && state.photoArray[index]) {
          const photo = state.photoArray[index];

          // Handle nested keys like "exif.ShutterSpeedValue"
          if (key.includes(".")) {
            const keys = key.split(".");
            let current = photo;

            // Traverse the nested object up to the second-to-last key
            for (let i = 0; i < keys.length - 1; i++) {
              const k = keys[i];
              if (!current[k]) {
                current[k] = {}; // Create nested object if it doesn't exist
              }
              current = current[k];
            }

            // Update the final key with the new value
            current[keys[keys.length - 1]] = value;
          } else {
            // Handle non-nested keys
            photo[key] = value;
          }

          return {
            photoArray: [...state.photoArray], // Return updated photoArray
          };
        } else {
          return state;
        }
      });
    },
    updateArrayElementByUid: (uid, arrayKey, value, index, propertyKey) => {
      set((state) => {
        const photoIndex = state.uidHashmap[uid];

        // Check if the photo exists and the arrayKey refers to an array
        if (
          photoIndex !== undefined &&
          Array.isArray(state.photoArray[photoIndex]?.[arrayKey])
        ) {
          const updatedArray = [...state.photoArray[photoIndex][arrayKey]];

          // Check if the index is valid and the element is an object
          if (
            index >= 0 &&
            index < updatedArray.length &&
            typeof updatedArray[index] === "object"
          ) {
            updatedArray[index] = {
              ...updatedArray[index],
              [propertyKey]: value, // Update the specific property in the object
            };
          }

          // Update the photoArray with the modified array
          return {
            photoArray: state.photoArray.map((photo, idx) =>
              idx === photoIndex
                ? { ...photo, [arrayKey]: updatedArray } // Replace the array in the target photo
                : photo
            ),
          };
        }

        return state; // Return unchanged state if conditions are not met
      });
    },

    setPriceByUidAndPricetagIndex: (uid, pricetagIndex, price) =>
      set((state) => {
        const index = state.uidHashmap[uid];

        state.photoArray[index].pricetags[pricetagIndex].price = price;
        return {
          photoArray: state.photoArray,
        };
      }),
    updatePhotoPropertyById: (id, key, value) => {
      set((state) => {
        const index = state.photoIdHashmap[id];

        if (index !== -1) {
          state.photoArray[index][key] = value;
          return {
            photoArray: state.photoArray,
          };
        } else {
          return state;
        }
      });
    },

    setPhotoUploadResponse: (uid, response) =>
      set((state) => {
        const index = state.uidHashmap[uid];
        state.photoIdHashmap[response.id] = index;

        state.photoArray[index].response = response;

        return {
          photoIdHashmap: state.photoIdHashmap,
          photoArray: state.photoArray,
        };
      }),

    addPhoto: (uid, payload) =>
      set((state) => {
        const index = state.photoArray.length;

        state.uidHashmap[uid] = index;
        state.photoArray.push(payload);

        return {
          photoArray: state.photoArray,
          uidHashmap: state.uidHashmap,
        };
      }),
    removePhotoByUid: (uid) =>
      set((state) => {
        const index = state.uidHashmap[uid];

        if (index === undefined) return state; // Exit if uid not found

        // Remove photo from photoArray
        const updatedPhotoArray = state.photoArray.filter(
          (_, idx) => idx !== index
        );

        // Regenerate uidHashmap and photoIdHashmap with new indices
        const newUidHashmap = {};
        const newPhotoIdHashmap = {};

        updatedPhotoArray.forEach((photo, idx) => {
          const photoId = photo?.response?.id;
          const photoUid = photo?.file?.uid;
          if (photoId) {
            newPhotoIdHashmap[photoId] = idx;
          }
          newUidHashmap[photoUid] = idx;
        });

        // Set selectedPhoto as the first element in the newUidHashmap
        const newSelectedPhoto =
          state.selectedPhoto === uid
            ? Object.keys(newUidHashmap)[0] || null
            : state.selectedPhoto;
        return {
          photoArray: updatedPhotoArray,
          uidHashmap: newUidHashmap,
          photoIdHashmap: newPhotoIdHashmap,
          selectedPhoto: newSelectedPhoto,
        };
      }),

    removePhotoById: (photoId) =>
      set((state) => {
        const index = state.photoIdHashmap[photoId];

        if (index === -1) return state; // Exit if photoId not found

        const uid = state.photoArray[index].file.uid;

        // Remove photo from photoArray
        const updatedPhotoArray = state.photoArray.filter(
          (_, idx) => idx !== index
        );
        // Regenerate uidHashmap and photoIdHashmap with new indices
        const newUidHashmap = {};
        const newPhotoIdHashmap = {};

        updatedPhotoArray.forEach((photo, idx) => {
          const photoId = photo?.response?.id;
          const photoUid = photo?.file?.uid;
          if (photoId) {
            newPhotoIdHashmap[photoId] = idx;
          }
          newUidHashmap[photoUid] = idx;
        });

        // Set selectedPhoto as the first element in the newUidHashmap
        const newSelectedPhoto =
          state.selectedPhoto === uid
            ? Object.keys(newUidHashmap)[0] || null
            : state.selectedPhoto;

        return {
          photoArray: updatedPhotoArray,
          uidHashmap: newUidHashmap,
          photoIdHashmap: newPhotoIdHashmap,
          selectedPhoto: newSelectedPhoto,
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

    setIsOpenMapModal: (status) => {
      set({ isOpenMapModal: status });
    },

    isPhotoExistByUid: (uid) => {
      const state = useSellPhotoStore.getState();
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

    setNextSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
        if (!selectedPhoto || selectedPhoto === null) return {};
        const uids = Object.keys(uidHashmap);
        const currentIndex = uids.indexOf(selectedPhoto);

        if (currentIndex === -1) return {};
        const nextIndex = (currentIndex + 1) % uids.length;
        const nextUid = uids[nextIndex];

        return { selectedPhoto: nextUid };
      });
    },

    setPreviousSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
        if (!selectedPhoto || selectedPhoto === null) return {};

        const uids = Object.keys(uidHashmap);
        const currentIndex = uids.indexOf(selectedPhoto);

        if (currentIndex === -1) return {};

        const previousIndex = (currentIndex - 1 + uids.length) % uids.length;
        const previousUid = uids[previousIndex];

        return { selectedPhoto: previousUid };
      });
    },
  }))
);

export default useSellPhotoStore;
