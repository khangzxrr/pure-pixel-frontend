import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Schema } from "../apis/types";

// a photo of the booking detail screen: an uploaded booking photo or one being uploaded
export type BookingPhotoItem = {
  uid: string;
  id?: string;
  // read when rebuilding the id map in removePhotoByUid, never written by the booking screens
  photoId?: string;
  reviewUrl?: string;
  thumbnailUrl?: string;
  visibility?: Schema<"PhotoVisibility">;
  status?: string;
  percent?: number;
  [key: string]: unknown;
};

export type BookingPhotoUploadResponse = {
  id: string;
  reviewUrl?: string;
  thumbnailUrl?: string;
};

type NestedRecord = { [key: string]: unknown };

const isNestedRecord = (value: unknown): value is NestedRecord =>
  typeof value === "object" && value !== null;

type BookingPhotoState = {
  photoIdHashmap: Record<string, number>;
  uidHashmap: Record<string, number>;
  photoArray: BookingPhotoItem[];
  // uid of the selected photo; deleteImageById stores a photo object instead
  selectedPhoto: string | Partial<BookingPhotoItem> | null;
  isUpdatingPhotos: boolean;
  isOpenDraftModal: boolean;
  isOpenMapModal: boolean;
  getPhotoByUid: (uid: string) => BookingPhotoItem | undefined;
  setSelectedPhotoByUid: (uid: string) => void;
  updateSelectedPhotoProperty: (key: string, value: unknown) => void;
  updatePhotoPropertyByUid: (uid: string, key: string, value: unknown) => void;
  updatePhotoPropertyById: (id: string, key: string, value: unknown) => void;
  setPhotoUploadResponse: (
    uid: string,
    response: BookingPhotoUploadResponse
  ) => void;
  addPhoto: (uid: string, payload: BookingPhotoItem) => void;
  addPhotoWithId: (uid: string, payload: BookingPhotoItem) => void;
  removePhotoByUid: (uid: string) => void;
  removePhotoById: (photoId: string) => void;
  clearState: () => void;
  isPhotoExistByUid: (uid: string) => boolean;
  deleteImageById: (id: string) => void;
  setNextSelectedPhoto: () => void;
  setPreviousSelectedPhoto: () => void;
};

const initPhotoIdHashMap: Record<string, number> = {};
const initUiHashMap: Record<string, number> = {};
const initPhotoArray: BookingPhotoItem[] = [];

const useBookingPhotoStore = create<BookingPhotoState>()(
  devtools((set, get) => ({
    photoIdHashmap: initPhotoIdHashMap,
    uidHashmap: initUiHashMap,
    photoArray: initPhotoArray,
    selectedPhoto: null,
    isUpdatingPhotos: false,
    isOpenDraftModal: false,
    isOpenMapModal: false,

    getPhotoByUid: (uid) => {
      const index = get().uidHashmap[uid];

      return get().photoArray[index];
    },

    // setSelectedPhotoById: (id) =>
    //   set((state) => ({
    //     selectedPhoto: state.photoArray[state.photoIdHashmap[id]],
    //   })),
    setSelectedPhotoByUid: (uid) =>
      set(() => ({
        selectedPhoto: uid,
      })),

    updateSelectedPhotoProperty: (key, value) => {
      set((state) => {
        const selectedPhoto = state.selectedPhoto;
        // a uid or null selection has no properties to set (assigning to it threw)
        if (typeof selectedPhoto === "object" && selectedPhoto !== null) {
          selectedPhoto[key] = value;
        }
        return {
          selectedPhoto: state.selectedPhoto,
        };
      });
    },
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

    updatePhotoPropertyById: (id, key, value) => {
      set((state) => {
        // console.log("updatePhotoPropertyById", id, key, value);

        const index = state.photoIdHashmap[id];
        // console.log("index", index, state.photoIdHashmap, id);

        if (index !== undefined && state.photoArray[index]) {
          // console.log("updatePhotoPropertyById", state.photoArray[index]);

          state.photoArray[index][key] = value;
          // state.selectedPhoto[key] = value;

          return {
            photoArray: state.photoArray,
            // selectedPhoto: state.selectedPhoto,
          };
        } else {
          return state;
        }
      });
    },
    setPhotoUploadResponse: (uid, response) =>
      set((state) => {
        // console.log(response);

        const index = state.uidHashmap[uid];

        if (index === undefined) {
          // console.warn(`Photo with uid ${uid} not found.`);
          return state; // Exit if uid is not found
        }

        // Update photoIdHashmap with the new response id
        state.photoIdHashmap[response.id] = index;

        // Merge response as new fields into the existing photo object
        state.photoArray[index] = {
          ...state.photoArray[index],
          ...response, // Spread the response object, adding new fields or updating existing ones
        };

        return {
          photoIdHashmap: state.photoIdHashmap,
          photoArray: state.photoArray,
        };
      }),

    addPhoto: (uid, payload) =>
      set((state) => {
        const index = state.photoArray.length;

        //TODO: bao sua loi moi khi upload anh moi
        state.photoArray.push(payload);
        state.uidHashmap[uid] = index;

        return {
          photoArray: state.photoArray,
          uidHashmap: state.uidHashmap,
        };
      }),
    addPhotoWithId: (uid, payload) =>
      set((state) => {
        // Check if the uid already exists in uidHashmap or photoIdHashmap
        if (
          state.uidHashmap[uid] !== undefined ||
          state.photoIdHashmap[uid] !== undefined
        ) {
          // console.warn(`Photo with uid ${uid} already exists.`);
          return state; // Return the current state without making any changes
        }

        const index = state.photoArray.length;

        // Add entries to uidHashmap and photoIdHashmap
        state.uidHashmap[uid] = index;
        state.photoIdHashmap[uid] = index;

        // Add the photo to photoArray
        state.photoArray.push(payload);

        return {
          photoArray: state.photoArray,
          uidHashmap: state.uidHashmap,
          photoIdHashmap: state.photoIdHashmap,
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
          newUidHashmap[photo.uid] = idx;
          // String() matches the key an undefined id was coerced to before
          newPhotoIdHashmap[String(photo.photoId)] = idx;
        });
        const newSelectedPhotoIndex = updatedPhotoArray.length - 1;

        // Set selectedPhoto as the first element in the newUidHashmap
        const newSelectedPhoto =
          state.selectedPhoto === uid
            ? Object.keys(newUidHashmap)[newSelectedPhotoIndex] || null
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

        const uid = state.photoArray[index].uid;

        // Remove photo from photoArray
        const updatedPhotoArray = state.photoArray.filter(
          (_, idx) => idx !== index
        );

        // Regenerate uidHashmap and photoIdHashmap with new indices
        const newUidHashmap: Record<string, number> = {};
        const newPhotoIdHashmap: Record<string, number> = {};

        updatedPhotoArray.forEach((photo, idx) => {
          newUidHashmap[photo.uid] = idx;
          // String() matches the key an undefined id was coerced to before
          newPhotoIdHashmap[String(photo.id)] = idx;
        });
        const newSelectedPhotoIndex = updatedPhotoArray.length - 1;

        // Set selectedPhoto as the first element in the newUidHashmap
        const newSelectedPhoto =
          state.selectedPhoto === uid
            ? Object.keys(newUidHashmap)[newSelectedPhotoIndex] || null
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

    setNextSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
        // returning undefined replaced the whole store with undefined
        if (!selectedPhoto) return {};

        // Get all uids as an array from the keys of uidHashmap
        const uids = Object.keys(uidHashmap);
        // a photo object selection is never one of the uids
        const currentIndex =
          typeof selectedPhoto === "string" ? uids.indexOf(selectedPhoto) : -1;

        // If the current UID is not found, do nothing
        if (currentIndex === -1) return {};

        // Calculate the previous index using circular logic
        const previousIndex = (currentIndex - 1 + uids.length) % uids.length;
        const previousUid = uids[previousIndex];

        // console.log("setPrevious", currentIndex, previousIndex, previousUid);

        // Return the new selected UID
        return { selectedPhoto: previousUid };
      });
    },

    setPreviousSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
        // returning undefined replaced the whole store with undefined
        if (!selectedPhoto) return {};

        // Get all uids as an array from the keys of uidHashmap
        const uids = Object.keys(uidHashmap);
        // a photo object selection is never one of the uids
        const currentIndex =
          typeof selectedPhoto === "string" ? uids.indexOf(selectedPhoto) : -1;

        // If the current UID is not found, do nothing
        if (currentIndex === -1) return {};

        // Calculate the next index with wrap-around to the start of the array
        const nextIndex = (currentIndex + 1) % uids.length;
        const nextUid = uids[nextIndex];

        // console.log("setNext", currentIndex, nextIndex, nextUid);

        // Return the new selected UID
        return { selectedPhoto: nextUid };
      });
    },
  }))
);

export default useBookingPhotoStore;
