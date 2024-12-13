import http, { timeoutHttpClient } from "./../configs/Http";

// const getPublicPhotos = async (limit, page, categoryName) => {

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
  search,
  photographerId,
  cameraId,
  bookmarked,
  tags,
  isFollowed
) => {
  // Tạo một đối tượng chứa các tham số cơ bản
  const params = {
    limit,
    page,
  };

  if (search) {
    params.search = search;
  }
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
  if (selling !== undefined && selling !== null) {
    params.selling = selling;
  }
  if (photographerId) {
    params.photographerId = photographerId;
  }
  if (cameraId) {
    params.cameraId = cameraId;
  }
  if (bookmarked !== undefined && bookmarked !== null) {
    params.bookmarked = bookmarked;
  }

  if (tags && tags.length > 0 && tags[0] !== "") {
    params.tags = tags[0];
  }
  if (isFollowed !== undefined && isFollowed !== null && isFollowed !== "") {
    params.isFollowed = isFollowed;
  }

  // Tạo instance URLSearchParams
  const queryString = new URLSearchParams(params);

  const url = `/photo/public?${queryString.toString()}`;

  const response = await http.get(url);
  return response.data;
};

const getPhotoTags = async ({ top }) => {
  const response = await http.get(`/photo-tag?top=${top}`);
  return response.data;
};
// Send the PATCH request to update the user's profile
const uploadPhoto = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.post(`photo/v2/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    timeout: 30000,
    onUploadProgress,
  });

  return response.data;
};

const updatePhotos = async (photo) => {
  // Destructure the photo object to exclude the id field
  const { id, ...photoWithoutId } = photo;

  const response = await http.patch(`photo/${id}`, {
    ...photoWithoutId,
  });

  return response;
};

const addWatermark = async (photo) => {
  const res = await http.post(`/photo/${photo.photoId}/watermark`, {
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

const getNextPublicById = async (id) => {
  const response = await http.get(
    `photo/public/next?cursor=${id}&forward=true`
  );

  return response.data;
};

const getPreviousPublicById = async (id) => {
  const response = await http.get(
    `photo/public/next?cursor=${id}&forward=false`
  );

  return response.data;
};

const getPhotoComments = async (id) => {
  const response = await http.get(`photo/${id}/comment`);
  return response.data;
};

const commentPhoto = async (id, content, onProgress) => {
  const response = await http.post(`photo/${id}/comment`, content, {
    onUploadProgress: (progressEvent) => {
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

const sharePhotoById = async (photoId, size) => {
  const response = await http.post(`photo/share`, {
    photoId,
    size,
  });

  return response.data;
};
const PhotoApi = {
  getPublicPhotos,
  uploadPhoto,
  updatePhotos,
  deletePhoto,
  getPhotoById,
  getPhotoComments,
  commentPhoto,
  addWatermark,
  getAvailableResolutionsByPhotoId,
  sharePhotoById,
  getPhotoTags,
  getNextPublicById,
  getPreviousPublicById,
};

export default PhotoApi;
