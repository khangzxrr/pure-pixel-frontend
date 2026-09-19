import { create } from "zustand"; // Import `zustand` to create a store
import { devtools } from "zustand/middleware"; // Import `devtools` middleware for debugging
import type { Schema } from "../apis/types";

type NestedRecord = { [key: string]: unknown };

const isNestedRecord = (value: unknown): value is NestedRecord =>
  typeof value === "object" && value !== null;

// photo being edited in the update photo modal, a copy of the photo plus form fields
// photoTags here is the plain tag names the form reads/writes, not the API's { name }[] shape
export type SelectedUpdatePhoto = Partial<
  Omit<Schema<"SignedPhotoDto">, "exif" | "photoTags">
> & {
  exif?: { latitude?: number; longitude?: number; [key: string]: unknown };
  photoTags?: string[];
  isChangeGPS?: boolean;
  address?: string;
  originalPhotoUrl?: string;
  thumbnailPhotoUrl?: string;
  [key: string]: unknown;
};

export type SelectedUpgradePackage = Partial<
  Pick<
    Schema<"UpgradePackageDto">,
    "id" | "name" | "minOrderMonth" | "maxPackageCount" | "maxPhotoQuota"
  >
> & {
  migratePrice?: number;
  transactionId?: string;
  mockQrCode?: string;
};

type ModalState = {
  isUpdatePhotoModal: boolean;
  setIsUpdatePhotoModal: (value: boolean) => void;

  isUpdateOpenMapModal: boolean;
  setIsUpdateOpenMapModal: (value: boolean) => void;

  isDeletePhotoConfirmModal: boolean;
  setIsDeletePhotoConfirmModal: (value: boolean) => void;
  deletePhotoId: string;
  setDeletePhotoId: (id: string) => void;
  numberOfRecord: number;
  setNumberOfRecord: (num: number) => void;
  isUpgradePackageQRModal: boolean;
  setIsUpgradePackageQRModal: (value: boolean) => void;

  isUpgradePaymentModal: boolean;
  setIsUpgradePaymentModal: (value: boolean) => void;

  selectedUpdatePhoto: SelectedUpdatePhoto;
  setSelectedPhoto: (photo: SelectedUpdatePhoto) => void;
  updateSelectedUpdatePhotoField: (key: string, value: unknown) => void;

  selectedUpgradePackage: SelectedUpgradePackage;
  setSelectedUpgradePackage: (packageItem: SelectedUpgradePackage) => void;

  isUpdateProfileModalVisible: boolean;
  setIsUpdateProfileModalVisible: (value: boolean) => void;

  isUpdatePhotoshootPackageModal: boolean;
  setIsUpdatePhotoshootPackageModal: (value: boolean) => void;
  // starts as {}, then holds the id of the package being edited ("" when cleared)
  selectedUpdatePhotoshootPackage: string | Record<string, never>;
  setSelectedUpdatePhotoshootPackage: (
    packageItem: string | Record<string, never>
  ) => void;
  deleteShowcasesList: string[];
  setDeleteShowcasesList: (id: string) => void;
  clearDeleteShowcasesList: () => void;
};

// Create a Zustand store for managing modal states
const useModalStore = create<ModalState>()(
  devtools((set) => ({
    // State and setter for "Update Photo" modal visibility
    isUpdatePhotoModal: false,
    setIsUpdatePhotoModal: (value) => set({ isUpdatePhotoModal: value }),

    // State and setter for "Update Open Map" modal visibility
    isUpdateOpenMapModal: false,
    setIsUpdateOpenMapModal: (value) => set({ isUpdateOpenMapModal: value }),

    // State and setter for "Delete Photo Confirm" modal visibility
    isDeletePhotoConfirmModal: false,
    setIsDeletePhotoConfirmModal: (value) =>
      set({ isDeletePhotoConfirmModal: value }),
    deletePhotoId: "",
    setDeletePhotoId: (id) => set({ deletePhotoId: id }),
    numberOfRecord: 0,
    setNumberOfRecord: (num) => set({ numberOfRecord: num }),
    // State and setter for "Upgrade Package QR" modal visibility
    isUpgradePackageQRModal: false,
    setIsUpgradePackageQRModal: (value) =>
      set({ isUpgradePackageQRModal: value }),

    // State and setter for "Upgrade Payment" modal visibility
    isUpgradePaymentModal: false,
    setIsUpgradePaymentModal: (value) => set({ isUpgradePaymentModal: value }),

    // State to store selected photo details and related setters
    selectedUpdatePhoto: {}, // Object to store the currently selected photo details
    setSelectedPhoto: (photo) => set({ selectedUpdatePhoto: photo }), // Setter for selected photo details
    updateSelectedUpdatePhotoField: (key, value) => {
      set((state) => {
        const selectedUpdatePhoto = { ...state.selectedUpdatePhoto }; // Copy the selected update photo object for immutability

        // Handle nested keys like "exif.ShutterSpeedValue"
        if (key.includes(".")) {
          const keys = key.split(".");
          let current: NestedRecord = selectedUpdatePhoto;

          // Traverse to the second-to-last key
          for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            const next = current[k];

            if (isNestedRecord(next)) {
              current = next; // Move deeper
            } else {
              // Create the nested object if it doesn't exist
              const created: NestedRecord = {};
              current[k] = created;
              current = created;
            }
          }

          // Update the final key
          current[keys[keys.length - 1]] = value;
        } else {
          // Handle non-nested keys
          selectedUpdatePhoto[key] = value;
        }

        // Return the updated state
        return {
          ...state, // Keep the rest of the state unchanged
          selectedUpdatePhoto, // Replace the updated selectedUpdatePhoto in the state
        };
      });
    },

    // State to store selected upgrade package details and setter
    selectedUpgradePackage: {}, // Object to store the selected upgrade package
    setSelectedUpgradePackage: (packageItem) =>
      set({ selectedUpgradePackage: packageItem }),

    // State and setter for "Update Profile" modal visibility
    isUpdateProfileModalVisible: false, // Initial visibility state of the profile modal
    setIsUpdateProfileModalVisible: (value) =>
      set({ isUpdateProfileModalVisible: value }), // Setter for profile modal visibility

    // Set the name of the store for update photoshootpackage modal
    isUpdatePhotoshootPackageModal: false,
    setIsUpdatePhotoshootPackageModal: (value) =>
      set({ isUpdatePhotoshootPackageModal: value }),
    selectedUpdatePhotoshootPackage: {}, // Object to store the currently selected photoshoot package details
    setSelectedUpdatePhotoshootPackage: (packageItem) =>
      set({ selectedUpdatePhotoshootPackage: packageItem }),
    deleteShowcasesList: [],
    setDeleteShowcasesList: (id) =>
      set((state) => {
        const updatedList = [...state.deleteShowcasesList, id];
        return { deleteShowcasesList: updatedList };
      }),
    clearDeleteShowcasesList: () =>
      set(() => {
        return { deleteShowcasesList: [] };
      }),
  }))
);

export default useModalStore; // Export the store for use in components
