import http from "../configs/Http";

const getPresignedUploadUrl = async ({ queryKey }) => {
  // eslint-disable-next-line no-unused-vars
  const [_key, { filename }] = queryKey;

  const response = await http.get(`/photographer/me/upload/${filename}`, {
    crossdomain: true,
  });

  return response.data;
};

const PhotographerApi = {
  getPresignedUploadUrl,
};

export default PhotographerApi;
