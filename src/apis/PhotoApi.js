import http from "../configs/Http";

const getPublicPhotos = async () => {
  const response = await http.get("/photo/public", { crossdomain: true });

  return response.data;
};

const PhotoApi = {
  getPublicPhotos,
};

export default PhotoApi;
