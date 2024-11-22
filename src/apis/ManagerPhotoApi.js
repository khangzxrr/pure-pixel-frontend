import http from "../configs/Http";

const getAllPhotos = async (limit, page, orderByCreatedAt) => {
  const params = {
    limit,
    page,
  };

  if (orderByCreatedAt) {
    params.orderByCreatedAt = orderByCreatedAt;
  }
  const queryString = new URLSearchParams(params).toString();
  const url = `manager/photo?${queryString}`;
  const response = await http.get(url);
  return response.data;
};

const deletePhoto = async (id) => {
  const url = `manager/photo/${id}`;
  const response = await http.delete(url);
  return response.data;
};

const updatePhoto = async (id, updateBody) => {
  const url = `manager/photo/${id}`;
  const response = await http.patch(url, updateBody);
  return response.data;
};
const ManagerPhotoApi = { getAllPhotos, deletePhoto, updatePhoto };
export default ManagerPhotoApi;
