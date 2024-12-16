import http from "../configs/Http";

const disablePhotoshootPackage = async (id) => {
  const response = await http.post(`/manager/photoshoot-package/${id}/disable`);
  return response.data;
};

const enablePhotoshootPackage = async (id) => {
  const response = await http.post(`/manager/photoshoot-package/${id}/enable`);
  return response.data;
};
export const PhotoshootPackageManager = {
  disablePhotoshootPackage,
  enablePhotoshootPackage,
};
