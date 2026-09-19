import http from "./../configs/Http";
import type { ResponseOf } from "./types";

const getTopCameras = async (top: number | string) => {
  const response = await http.get<ResponseOf<"CameraController_getTopBranch">>(
    `/camera/brand/popular?top=${top}`,
  );
  return response.data;
};

const getTopCamerasByBrandId = async (
  brandId: string,
  top: number | string,
) => {
  const response = await http.get<
    ResponseOf<"CameraController_getTopCameraOfBranch">
  >(`/camera/brand/${brandId}/top?top=${top}`);
  return response.data;
};

const getCameraChart = async () => {
  const response = await http.get<
    ResponseOf<"CameraController_getPopularCameraGraphs">
  >(`/camera/popular-graph`);
  return response.data;
};

const getCameraById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"CameraController_getCameraDetailById">
  >(`/camera/${id}`);
  return response.data;
};
const CameraApi = {
  getTopCameras,
  getTopCamerasByBrandId,
  getCameraChart,
  getCameraById,
};
export default CameraApi;
