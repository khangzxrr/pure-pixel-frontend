import create from "zustand";
import { devtools } from "zustand/middleware";

const useModalStore = create(
  devtools((set) => ({
    isUpdatePhotoModal: false,
    isUpdateOpenMapModal: false,
    isUpgradePackageQRModal: true,
    selectedUpdatePhoto: {},
    selectedUpgradePackage: {},
    isUpdateProfileModalVisible: false, // Initial state of the modal
    setIsUpdateProfileModalVisible: (value) =>
      set({ isUpdateProfileModalVisible: value }), // Function to update the modal state
    setIsUpdatePhotoModal: (value) => set({ isUpdatePhotoModal: value }),
    setIsUpgradePackageQRModal: (value) =>
      set({ isUpgradePackageQRModal: value }),
    setSelectedUpgradePackage: (packageItem) =>
      set({ selectedUpgradePackage: packageItem }),
    setIsUpdateOpenMapModal: (value) => set({ isUpdateOpenMapModal: value }),

    setSelectedPhoto: (photo) => set({ selectedUpdatePhoto: photo }),
    updateSelectedUpdatePhotoField: (field, value) =>
      set((state) => ({
        selectedUpdatePhoto: {
          ...state.selectedUpdatePhoto,
          [field]: value,
        },
      })),
  }))
);

export default useModalStore;
