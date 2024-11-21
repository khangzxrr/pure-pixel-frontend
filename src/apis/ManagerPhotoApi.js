import http from "../configs/Http";

const getAllPhotos = async (limit, page) => {
  const params = {
    limit,
    page,
  };
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
const ManagerPhotoApi = { getAllPhotos, deletePhoto };
export default ManagerPhotoApi;
