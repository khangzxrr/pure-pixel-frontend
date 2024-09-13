import http from "../configs/Http";

const getPresignedUploadUrls = async ({ queryKey }) => {
  // eslint-disable-next-line no-unused-vars
  const [_key, { filename }] = queryKey;

  const response = await http.post(`/photographer/me/upload`, {
    crossdomain: true,
  });

  return response.data;
};

const getMyPhotos = async (skip, take) => {
  const response = await http.get(
    `/photographer/me/photo?skip=${skip}&take=${take}`,
  );

  return response.data;
};

const PhotographerApi = {
  getPresignedUploadUrls,
  getMyPhotos,
};

export default PhotographerApi;
