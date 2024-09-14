import axios from "axios";
import http from "../configs/Http";

const getPublicPhotos = async (skip, take) => {
  const response = await http.get(`/photo/public?skip=${skip}&take=${take}`, {
    crossdomain: true,
  });

  return response.data;
};

const getPresignedUploadUrls = async ({ filenames }) => {
  const response = await http.post(`/photo/upload`, {
    filenames,
  });

  return response.data;
};

const uploadPhotoUsingPresignedUrl = async (url, file, options) => {
  //FUCK AXIOS
  //waste me 2 hour just for a fucking upload feature???
  //using the RAW axios instead of modified one, or you will get CORS
  const response = await axios.put(url, file, options);

  return response.data;
};

const processPhotos = async (presignedData) => {
  const response = await http.post(`photo/process`, presignedData);

  return response;
};

const updatePhotos = async (photos) => {
  const response = await http.patch(`photo/update`, {
    photos,
  });

  return response;
};

const getPhotoById = async (id) => {
  const response = await http.get(`photo/${id}`);

  return response;
};

const PhotoApi = {
  getPublicPhotos,
  getPresignedUploadUrls,
  uploadPhotoUsingPresignedUrl,
  processPhotos,
  updatePhotos,
  getPhotoById,
};

export default PhotoApi;
