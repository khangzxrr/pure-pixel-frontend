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
    updateSelectedUpdatePhotoField: (field, value) =>
      set((state) => ({
        selectedUpdatePhoto: {
          ...state.selectedUpdatePhoto, // Copy existing fields
          [field]: value, // Update the specified field
        },
      })),

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
        console.log("Updated deleteShowcasesList:", updatedList);
        return { deleteShowcasesList: updatedList };
      }),
    clearDeleteShowcasesList: () =>
      set(() => {
        console.log("Clearing deleteShowcasesList");
        return { deleteShowcasesList: [] };
      }),
  }))
);

export default useModalStore; // Export the store for use in components
