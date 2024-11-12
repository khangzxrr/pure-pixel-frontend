import http from "../configs/Http";

const getPackagesByPhotographerId = async (photographerId, limit, page) => {
  const response = await http.get(
    `photoshoot-package/photographer/${photographerId}?limit=${limit}&page=${page}`
  );
  return response.data;
};

const findAll = async (limit, page) => {
  const params = {
    limit,
    page,
  };
  const queryString = new URLSearchParams(params).toString();
  const url = `/photoshoot-package?${queryString}`;
  const response = await http.get(url);

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
