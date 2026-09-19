import http from "../configs/Http";
import type { ResponseOf } from "./types";

const disablePhotoshootPackage = async (id: string) => {
  const response = await http.post<
    ResponseOf<"ManagerPhotoShootPackageController_disablePhotoshootPackage">
  >(`/manager/photoshoot-package/${id}/disable`);
  return response.data;
};

const enablePhotoshootPackage = async (id: string) => {
  const response = await http.post<
    ResponseOf<"ManagerPhotoShootPackageController_enablePhotoshootPackage">
  >(`/manager/photoshoot-package/${id}/enable`);
  return response.data;
};
export const PhotoshootPackageManager = {
  disablePhotoshootPackage,
  enablePhotoshootPackage,
};
