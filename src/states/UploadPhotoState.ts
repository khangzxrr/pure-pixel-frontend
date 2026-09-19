import type { RcFile } from "antd/es/upload/interface";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Schema } from "../apis/types";

type NestedRecord = { [key: string]: unknown };

const isNestedRecord = (value: unknown): value is NestedRecord =>
  typeof value === "object" && value !== null;

export type UploadPhotoStatus =
  | "uploading"
  | "done"
  | "error"
  | "outQuota"
  | "duplicated"
  | "invalid"
  | "failed";

// an entry of the upload queue, built by the upload components
export type UploadPhotoItem = {
  file: RcFile;
  reviewUrl?: string;
  title?: string;
  description?: string;
  exif?: { latitude?: number; longitude?: number; [key: string]: unknown };
  watermark?: boolean;
  watermarkContent?: string;
  visibility?: Schema<"PhotoVisibility">;
  status?: UploadPhotoStatus;
  percent?: number;
  // photo returned by the upload endpoint
  response?: Schema<"SignedPhotoDto">;
  // read by isPhotoExistByUid and deleteImageById
  uid?: string;
  id?: string;
  // other form fields are written through updatePhotoPropertyByUid
  [key: string]: unknown;
};

type UploadPhotoState = {
  photoIdHashmap: Record<string, number>;
  uidHashmap: Record<string, number>;
  photoArray: UploadPhotoItem[];
  // uid of the selected photo; deleteImageById stores a photo object instead
  selectedPhoto: string | Partial<UploadPhotoItem> | null;
  isUpdatingPhotos: boolean;
  isOpenDraftModal: boolean;
  isOpenMapModal: boolean;
  getPhotoByUid: (uid: string) => UploadPhotoItem | undefined;
  setSelectedPhotoByUid: (uid: string) => void;
  updateSelectedPhotoProperty: (key: string, value: unknown) => void;
  updatePhotoPropertyByUid: (uid: string, key: string, value: unknown) => void;
  updatePhotoPropertyById: (id: string, key: string, value: unknown) => void;
  setPhotoUploadResponse: (
    uid: string,
    response: Schema<"SignedPhotoDto">
  ) => void;
  addPhoto: (uid: string, payload: UploadPhotoItem) => void;
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
const initPhotoArray: UploadPhotoItem[] = [];

const useUploadPhotoStore = create<UploadPhotoState>()(
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
        const index = state.photoIdHashmap[id];

        if (index !== undefined && state.photoArray[index]) {
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
        // console.log("addPhoto", payload);
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
        // console.log("removePhotoById", index, photoId);
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

        // Return the new selected UID
        return { selectedPhoto: nextUid };
      });
    },

    setPreviousSelectedPhoto: () => {
      set((state) => {
        const { uidHashmap, selectedPhoto } = state;
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

        // Return the new selected UID
        return { selectedPhoto: previousUid };
      });
    },
  }))
);

export default useUploadPhotoStore;
