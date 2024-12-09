import http from "../configs/Http";

const getPhotoManager = async (
  limit,
  page,
  categoryName,
  orderByCreatedAt,
  orderByUpvote,
  watermark,
  selling,
  photographerName,
  title,
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
  if (photographerName) {
    params.photographerName = photographerName;
  }
  if (title) {
    params.title = title;
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

  const url = `/manager/photo?${queryString.toString()}`;

  const response = await http.get(url);
  return response.data;
};

const PhotoManagerApi = { getPhotoManager };

export default PhotoManagerApi;
