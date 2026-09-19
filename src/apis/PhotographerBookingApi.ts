import http, { timeoutHttpClient } from "../configs/Http";
import type { QueryOf, ResponseOf } from "./types";

type BookingQuery = QueryOf<"PhotographerBookingController_findAllBooking">;

const findAllBooking = async (
  limit: number,
  page: number,
  status: BookingQuery["status"] | "" | null,
  orderByCreatedAt: BookingQuery["orderByCreatedAt"],
) => {
  const response = await http.get<
    ResponseOf<"PhotographerBookingController_findAllBooking">
  >(
    `/photographer/booking/me?limit=${limit}&page=${page}${
      status ? `&status=${status}` : ""
    }&orderByCreatedAt=${orderByCreatedAt}`,
  );

  return response.data;
};

const findById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerBookingController_getBookingDetail">
  >(`/photographer/booking/${id}`);

  return response.data;
};

const denyBooking = async (id: string) => {
  const response = await http.post<
    ResponseOf<"PhotographerBookingController_denyBooking">
  >(`/photographer/booking/${id}/deny`);

  return response.data;
};

const acceptBooking = async (id: string) => {
  const response = await http.post<
    ResponseOf<"PhotographerBookingController_acceptBooking">
  >(`/photographer/booking/${id}/accept`);

  return response.data;
};

const paidBooking = async (bookingId: string) => {
  const response = await http.patch<
    ResponseOf<"PhotographerBookingController_paidBooking">
  >(`/photographer/booking/${bookingId}/paid`);

  return response.data;
};

const deleteBookingPhoto = async (bookingId: string, photoId: string) => {
  const response = await http.delete<
    ResponseOf<"PhotographerBookingController_deletePhotoBooking">
  >(`/photographer/booking/${bookingId}/photo/${photoId}`);

  return response.data;
};
const upload = async (id: string, file: Blob) => {
  const customHttp = timeoutHttpClient(300000);

  const formData = new FormData();
  formData.append("file", file);

  const response = await customHttp.put<
    ResponseOf<"PhotographerBookingController_uploadPhoto">
  >(`/photographer/booking/${id}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const PhotographerBookingApi = {
  findAllBooking,
  denyBooking,
  acceptBooking,
  paidBooking,
  upload,
  findById,
  deleteBookingPhoto,
};
