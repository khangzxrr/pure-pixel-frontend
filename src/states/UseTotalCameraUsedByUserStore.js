import { create } from "zustand";
const UseTotalCameraUsedByUserStore = create((set) => ({
  idCameraByBrand: "",
  setIdCameraByBrand: (idCameraByBrand) => set({ idCameraByBrand }),

  nameCameraByBrand: "",
  setNameCameraByBrand: (nameCameraByBrand) => set({ nameCameraByBrand }),
}));
export default UseTotalCameraUsedByUserStore;
