import http from "../configs/Http";

const getPresignedUploadUrls = async ({ queryKey }) => {
  // eslint-disable-next-line no-unused-vars
  const [_key, { filename }] = queryKey;

  const response = await http.post(`/photographer/me/upload`, {
    crossdomain: true,
  });

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
  if (selling) {
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

const PhotographerApi = {
  getPresignedUploadUrls,
  getMyPhotos,
};

export default PhotographerApi;
