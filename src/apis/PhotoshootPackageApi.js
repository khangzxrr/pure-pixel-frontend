import http from "../configs/Http";

const getPackagesByPhotographerId = async (photographerId, limit, page) => {
  const response = await http.get(
    `photoshoot-package/photographer/${photographerId}?limit=${limit}&page=${page}`
  );
  return response.data;
};

const PhotoshootPackageApi = { getPackagesByPhotographerId };

export default PhotoshootPackageApi;
