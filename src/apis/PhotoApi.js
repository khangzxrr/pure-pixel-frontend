import axios from "axios";
import http from "./../configs/Http";

// const getPublicPhotos = async (limit, page, categoryName) => {
//   //go 1 chu no nhay chung 1000 cai suggest
//   //AI SUCKK
//   //Nếu categoryName không tồn tại hoặc là undefined, không thêm nó vào URL
//   const url = categoryName
//     ? `/photo/public?limit=${limit}&page=${page}&categoryName=${categoryName}`
//     : `/photo/public?limit=${limit}&page=${page}`;

//   const response = await http.get(url);
//   return response.data;
// };
const getPublicPhotos = async (
  limit,
  page,
  categoryName,
  orderByCreatedAt,
  orderByUpvote,
  watermark,
  selling,
  photographerName,
  title
) => {
  // Tạo một đối tượng chứa các tham số
  const params = {
    limit,
    page,
  };

  // Chỉ thêm categoryName nếu nó tồn tại và không phải là undefined hoặc null
  if (categoryName) {
    params.categoryName = categoryName;
  }
  if (orderByCreatedAt) {
    params.orderByCreatedAt = orderByCreatedAt;
  }
  if (orderByUpvote) {
    params.orderByUpvote = orderByUpvote;
  }
  if (watermark) {
    params.watermark = watermark;
  }
  if (selling) {
    params.selling = selling;
  }
  if (photographerName) {
    params.photographerName = photographerName;
  }
  if (title) {
    params.title = title;
  }
  // Tạo chuỗi truy vấn từ đối tượng params
  const queryString = new URLSearchParams(params).toString();
  const url = `/photo/public?${queryString}`;

  const response = await http.get(url);
  return response.data;
};

const getPresignedUploadUrls = async ({ filename }) => {
  const response = await http.post(`/photo/upload`, {
    filename,
  });

  return response.data;
};

const getPhotoTags = async ({ top }) => {
  const response = await http.get(`/photo-tag?top=${top}`);
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

const updatePhotos = async (photo) => {
  const response = await http.patch(`photo/${photo.id}`, {
    photo,
  });

  return response;
};
const addWatermark = async (photo) => {
  const res = await http.post("/photo/watermark", {
    photoId: photo.photoId,
    text: photo.text,
  });
  return res;
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
  addWatermark,
  getAvailableResolutionsByPhotoId,
  sharePhotoById,
  getPhotoTags,
};

export default PhotoApi;
