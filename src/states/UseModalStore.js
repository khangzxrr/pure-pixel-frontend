import { create } from "zustand"; // Import `zustand` to create a store
import { devtools } from "zustand/middleware"; // Import `devtools` middleware for debugging

// Create a Zustand store for managing modal states
const useModalStore = create(
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
          let current = selectedUpdatePhoto;

          // Traverse to the second-to-last key
          for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];

            // Create the nested object if it doesn't exist
            if (!current[k]) {
              current[k] = {};
            }

            current = current[k]; // Move deeper
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
