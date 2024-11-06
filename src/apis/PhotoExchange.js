import http from "../configs/Http";

const getPhotoBought = async () => {
  const response = await http.get(`photo-exchange/me/photo-buy`);
  return response.data;
};

const getPhotoBoughtDetail = async (id) => {
  const response = await http.get(`photo/${id}/photo-buy`);
  return response.data;
};
const getPhotoBoughtDetailDownload = async (id, photoBuyId) => {
  const response = await http.get(
    `photo/${id}/photo-buy/${photoBuyId}/download`,
    {
      responseType: "blob",
    }
  );
  return response.data;
};
const PhotoExchange = {
  getPhotoBought,
  getPhotoBoughtDetail,
  getPhotoBoughtDetailDownload,
};

export default PhotoExchange;
