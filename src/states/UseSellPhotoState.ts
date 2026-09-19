import type { RcFile } from "antd/es/upload/interface";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Schema } from "../apis/types";

// an available resolution of an uploaded photo with the price the photographer sets
export type SellPricetag = Schema<"PhotoSizeDto"> & { price: number };

// an entry of the sell photo upload queue, built by the sell photo components
export type SellPhotoItem = {
  file: RcFile;
  reviewUrl?: string;
  title?: string;
  description?: string;
  exif?: { latitude?: number; longitude?: number; [key: string]: unknown };
  watermark?: boolean;
  visibility?: Schema<"PhotoVisibility">;
  status?: string;
  percent?: number;
  // photo returned by the upload endpoint
  response?: Schema<"SignedPhotoDto">;
  pricetags?: SellPricetag[];
  // read by isPhotoExistByUid and deleteImageById
  uid?: string;
  id?: string;
  // other form fields are written through updatePhotoPropertyByUid
  [key: string]: unknown;
};

type NestedRecord = { [key: string]: unknown };

const isNestedRecord = (value: unknown): value is NestedRecord =>
  typeof value === "object" && value !== null;

type SellPhotoState = {
  photoIdHashmap: Record<string, number>;
  uidHashmap: Record<string, number>;
  photoArray: SellPhotoItem[];
  // uid of the selected photo; deleteImageById stores a photo object instead
  selectedPhoto: string | Partial<SellPhotoItem> | null | undefined;
  isUpdatingPhotos: boolean;
  isOpenDraftModal: boolean;
  isOpenMapModal: boolean;
  disableUpload: boolean;
  setDisableUpload: (status: boolean) => void;
  getPhotoByUid: (uid: string) => SellPhotoItem | undefined;
  // the sell page passes `photoArray[0]?.file?.uid`
  setSelectedPhotoByUid: (uid: string | undefined) => void;
  updatePhotoPropertyByUid: (uid: string, key: string, value: unknown) => void;
  updateArrayElementByUid: (
    uid: string,
    arrayKey: string,
    value: unknown,
    index: number,
    propertyKey: string
  ) => void;
  setPriceByUidAndPricetagIndex: (
    uid: string,
    pricetagIndex: number,
    price: number
  ) => void;
  updatePhotoPropertyById: (id: string, key: string, value: unknown) => void;
  setPhotoUploadResponse: (
    uid: string,
    response: Schema<"SignedPhotoDto">
  ) => void;
  addPhoto: (uid: string, payload: SellPhotoItem) => void;
  removePhotoByUid: (uid: string) => void;
  removePhotoById: (photoId: string) => void;
  clearState: () => void;
  setIsOpenDraftModal: (status: boolean) => void;
  setIsOpenMapModal: (status: boolean) => void;
  isPhotoExistByUid: (uid: string) => boolean;
  deleteImageById: (id: string) => void;
  toggleWatermark: (status: boolean) => void;
  setNextSelectedPhoto: () => void;
  setPreviousSelectedPhoto: () => void;
};

const initPhotoIdHashMap: Record<string, number> = {};
const initUiHashMap: Record<string, number> = {};
const initPhotoArray: SellPhotoItem[] = [];

const useSellPhotoStore = create<SellPhotoState>()(
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
      set(() => ({
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
            let current: NestedRecord = photo;

            // Traverse the nested object up to the second-to-last key
            for (let i = 0; i < keys.length - 1; i++) {
              const k = keys[i];
              const next = current[k];
              if (isNestedRecord(next)) {
                current = next;
              } else {
                const created: NestedRecord = {}; // Create nested object if it doesn't exist
                current[k] = created;
                current = created;
              }
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
        const targetArray =
          photoIndex !== undefined
            ? state.photoArray[photoIndex]?.[arrayKey]
            : undefined;

        // Check if the photo exists and the arrayKey refers to an array
        if (Array.isArray(targetArray)) {
          const updatedArray: unknown[] = [...targetArray];
          const element = updatedArray[index];

          // Check if the index is valid and the element is an object
          if (
            index >= 0 &&
            index < updatedArray.length &&
            typeof element === "object"
          ) {
            updatedArray[index] = {
              ...element,
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

        // a photo whose resolutions have not loaded yet has no pricetags (writing to them threw)
        const pricetag = state.photoArray[index].pricetags?.[pricetagIndex];
        if (pricetag) {
          pricetag.price = price;
        }
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
        const newUidHashmap: Record<string, number> = {};
        const newPhotoIdHashmap: Record<string, number> = {};

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
        const newUidHashmap: Record<string, number> = {};
        const newPhotoIdHashmap: Record<string, number> = {};

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
      const state = get();
      return state.photoArray.some((photo) => photo.uid === uid);
    },

    deleteImageById: (id) =>
      set((state) => {
        const updatedPhotoArray = state.photoArray.filter(
          (image) => image.id !== id
        );
        const selectedPhoto = state.selectedPhoto;
        // a uid selection has no id; reading it from a null selection threw
        const selectedId =
          typeof selectedPhoto === "object" && selectedPhoto !== null
            ? selectedPhoto.id
            : undefined;
        const isDeletedSelected = selectedId === id;

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
        if (!selectedPhoto) return {};
        const uids = Object.keys(uidHashmap);
        // a photo object selection is never one of the uids
        const currentIndex =
          typeof selectedPhoto === "string" ? uids.indexOf(selectedPhoto) : -1;

        if (currentIndex === -1) return {};
        const nextIndex = (currentIndex + 1) % uids.length;
        const nextUid = uids[nextIndex];

        return { selectedPhoto: nextUid };
      });
    },

    setPreviousSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
        if (!selectedPhoto) return {};

        const uids = Object.keys(uidHashmap);
        // a photo object selection is never one of the uids
        const currentIndex =
          typeof selectedPhoto === "string" ? uids.indexOf(selectedPhoto) : -1;

        if (currentIndex === -1) return {};

        const previousIndex = (currentIndex - 1 + uids.length) % uids.length;
        const previousUid = uids[previousIndex];

        return { selectedPhoto: previousUid };
      });
    },
  }))
);

export default useSellPhotoStore;
