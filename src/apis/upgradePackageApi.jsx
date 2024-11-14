import http from "../configs/Http";

const upgradePackageList = async () => {
  const response = await http.get(`/upgrade-package?limit=9&page=0`);
  return response.data;
};
const getCurrentPackage = async () => {
  const response = await http.get(`me/current-upgrade-package`);
  return response.data;
};
const upgradeOrder = async (data) => {
  const response = await http.post(`/upgrade-order`, data);
  return response.data;
};

const upgradePackageApi = {
  getCurrentPackage,
  upgradeOrder,
  upgradePackageList,
};

export default upgradePackageApi;
