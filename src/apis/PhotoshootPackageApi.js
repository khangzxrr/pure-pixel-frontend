import http from "../configs/Http";

const getPackagesByPhotographerId = async (photographerId, limit, page) => {
  const response = await http.get(
    `photoshoot-package/photographer/${photographerId}?limit=${limit}&page=${page}`,
  );
  return response.data;
};

const findAll = async () => {
  const response = await http.get("/photoshoot-package?limit=10&page=0");

  return response.data;
};

const findById = async (id) => {
  const response = await http.get(`/photoshoot-package/${id}`);

  return response.data;
};

const PhotoshootPackageApi = {
  getPackagesByPhotographerId,
  findAll,
  findById,
};

export default PhotoshootPackageApi;
