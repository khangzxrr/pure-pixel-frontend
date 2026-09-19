import http from "../configs/Http";
import type { BodyOf, QueryOf, ResponseOf } from "./types";

const getPhotoBought = async (
  limit: number,
  page: number,
  orderByUpdatedAt?: QueryOf<"PhotoExchangeController_findAllPhotobuys">["orderByUpdatedAt"],
) => {
  const params: Record<string, string> = {
    limit: String(limit),
    page: String(page),
  };
  if (orderByUpdatedAt) {
    params.orderByUpdatedAt = orderByUpdatedAt;
  }

  const queryString = new URLSearchParams(params);

  const url = `/photo-exchange/me/photo-buy?${queryString.toString()}`;
  const response =
    await http.get<ResponseOf<"PhotoExchangeController_findAllPhotobuys">>(
      url,
    );
  return response.data;
};

const getPhotoBoughtDetail = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoSellBuyController_getBoughtPhoto">
  >(`photo/${id}/photo-buy`);
  return response.data;
};
const getPhotoBoughtDetailDownload = async (id: string, photoBuyId: string) => {
  const response = await http.get<Blob>(
    `photo/${id}/photo-buy/${photoBuyId}/download`,
    {
      responseType: "blob",
    },
  );
  return response.data;
};
const sellPhotoByPhotoId = async (
  photo: { id: string } & BodyOf<"PhotoSellBuyController_sellPhoto">,
) => {
  // Destructure the photo object to exclude the id field
  const { id, ...photoWithoutId } = photo;

  const response = await http.post<
    ResponseOf<"PhotoSellBuyController_sellPhoto">
  >(`photo/${id}/sell`, photoWithoutId);
  return response.data;
};
const PhotoExchange = {
  getPhotoBought,
  getPhotoBoughtDetail,
  getPhotoBoughtDetailDownload,
  sellPhotoByPhotoId,
};

export default PhotoExchange;
