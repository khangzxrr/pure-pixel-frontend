import http, { timeoutHttpClient } from "../configs/Http";

const findAllBooking = async (limit, page, status, orderByCreatedAt) => {
  const response = await http.get(
    `/photographer/booking/me?limit=${limit}&page=${page}${
      status ? `&status=${status}` : ""
    }&orderByCreatedAt=${orderByCreatedAt}`
  );

  return response.data;
};

const findById = async (id) => {
  const response = await http.get(`/photographer/booking/${id}`);

  return response.data;
};

const denyBooking = async (id) => {
  const response = await http.post(`/photographer/booking/${id}/deny`);

  return response.data;
};

const acceptBooking = async (id) => {
  const response = await http.post(`/photographer/booking/${id}/accept`);

  return response.data;
};

const paidBooking = async (bookingId) => {
  const response = await http.patch(`/photographer/booking/${bookingId}/paid`);

  return response.data;
};

const deleteBookingPhoto = async (bookingId, photoId) => {
  const response = await http.delete(
    `/photographer/booking/${bookingId}/photo/${photoId}`
  );

  return response.data;
};
const upload = async (id, file) => {
  const customHttp = timeoutHttpClient(300000);

  const formData = new FormData();
  formData.append("file", file);

  const response = await customHttp.put(
    `/photographer/booking/${id}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

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
