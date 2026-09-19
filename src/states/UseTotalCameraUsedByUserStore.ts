import { create } from "zustand";

type TotalCameraUsedByUserState = {
  idCameraByBrand: string;
  setIdCameraByBrand: (idCameraByBrand: string) => void;

  nameCameraByBrand: string;
  setNameCameraByBrand: (nameCameraByBrand: string) => void;
};

const UseTotalCameraUsedByUserStore = create<TotalCameraUsedByUserState>()(
  (set) => ({
    idCameraByBrand: "",
    setIdCameraByBrand: (idCameraByBrand) => set({ idCameraByBrand }),

    nameCameraByBrand: "",
    setNameCameraByBrand: (nameCameraByBrand) => set({ nameCameraByBrand }),
  })
);
export default UseTotalCameraUsedByUserStore;
