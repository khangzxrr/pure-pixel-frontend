import http from "./../configs/Http";

const getTopCameras = async (top) => {
  const response = await http.get(`/camera/brand/popular?top=${top}`);
  return response.data;
};

const getTopCamerasByBrandId = async (brandId, top) => {
  const response = await http.get(`/camera/brand/${brandId}/top?top=${top}`);
  return response.data;
};

const getCameraChart = async () => {
  const response = await http.get(`/camera/popular-graph`);
  return response.data;
};

const getCameraById = async (id) => {
  const response = await http.get(`/camera/${id}`);
  return response.data;
};
const CameraApi = {
  getTopCameras,
  getTopCamerasByBrandId,
  getCameraChart,
  getCameraById,
};
export default CameraApi;
