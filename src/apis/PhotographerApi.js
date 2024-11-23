import http from "../configs/Http";

const getPresignedUploadUrls = async ({ queryKey }) => {
  // eslint-disable-next-line no-unused-vars
  const [_key, { filename }] = queryKey;

  const response = await http.post(`/photographer/me/upload`, {
    crossdomain: true,
  });

  return response.data;
};

const getAllPhotographers = async (
  limit,
  page,
  search,
  orderByPhotoCount,
  orderByVoteCount,
  isFollowed,
  orderByFollower
) => {
  const params = {
    limit,
    page,
  };
  if (search) {
    params.search = search;
  }
  if (orderByPhotoCount) {
    params.orderByPhotoCount = orderByPhotoCount;
  }
  if (orderByVoteCount) {
    params.orderByVoteCount = orderByVoteCount;
  }
  if (isFollowed !== undefined && isFollowed !== null) {
    params.isFollowed = isFollowed;
  }
  if (orderByFollower) {
    params.orderByFollower = orderByFollower;
  }
  const queryString = new URLSearchParams(params).toString();
  const url = `/photographer?${queryString}`;
  const response = await http.get(url);
  return response.data;
};

const getMyPhotos = async (
  limit,
  page,
  // categoryName,
  orderByCreatedAt,
  orderByUpvote,
  watermark,
  selling,
  title
) => {
  const params = {
    limit,
    page,
    photoType: "RAW",
  };
  // if (categoryName) {
  //   params.categoryName = categoryName;
  // }
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
  if (title) {
    params.title = title;
  }
  const queryString = new URLSearchParams(params).toString();
  const url = `/photographer/me/photo?${queryString}`;
  const response = await http.get(url);
  // const response = await http.get(
  //   `/photographer/me/photo?limit=${limit}&page=${page}`
  // );

  return response.data;
};

const getPhotographerById = async (id) => {
  const response = await http.get(`/photographer/${id}/profile`);
  return response.data;
};

const PhotographerApi = {
  getPresignedUploadUrls,
  getAllPhotographers,
  getMyPhotos,
  getPhotographerById,
};

export default PhotographerApi;
