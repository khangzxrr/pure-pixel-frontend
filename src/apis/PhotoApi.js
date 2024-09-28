import axios from "axios";
import http from "./../configs/Http";

const getPublicPhotos = async (skip, take) => {
  //go 1 chu no nhay chung 1000 cai suggest
  //AI SUCKK
  const response = await http.get(`/photo/public?skip=${skip}&take=${take}`);

  return response.data;
};

const getPresignedUploadUrls = async ({ filename }) => {
  const response = await http.post(`/photo/upload`, {
    filename,
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

const processPhoto = async (signedUpload) => {
  const response = await http.post(`photo/process`, {
    signedUpload,
  });

  return response;
};

const updatePhotos = async (photos) => {
  const response = await http.patch(`photo/update`, {
    photos,
  });

  return response;
};

const deletePhoto = async (id) => {
  const response = await http.delete(`photo/${id}`);

  return response;
};

const getPhotoById = async (id) => {
  const response = await http.get(`photo/${id}`);

  return response.data;
};

const getPhotoComments = async (id) => {
  const response = await http.get(`photo/${id}/comment`);
  return response.data;
};

const commentPhoto = async (id, content, onProgress) => {
  const response = await http.post(`photo/${id}/comment`, content, {
    onUploadProgress: (progressEvent) => {
      console.log("progressEvent", progressEvent);

      if (onProgress) {
        // const percentCompleted = Math.round(
        //   (progressEvent.loaded * 100) / progressEvent.total
        // );
        onProgress(true);
      }
    },
  });

  return response.data;
};

const getAvailableResolutionsByPhotoId = async (id) => {
  const response = await http.get(`photo/${id}/available-resolution`);

  return response.data;
};

const sharePhotoById = async (photoId, quality) => {
  const response = await http.post(`photo/share`, {
    photoId,
    quality,
  });

  return response.data;
};

const PhotoApi = {
  getPublicPhotos,
  getPresignedUploadUrls,
  uploadPhotoUsingPresignedUrl,
  processPhoto,
  updatePhotos,
  deletePhoto,
  getPhotoById,
  getPhotoComments,
  commentPhoto,

  getAvailableResolutionsByPhotoId,
  sharePhotoById,
};

export default PhotoApi;
