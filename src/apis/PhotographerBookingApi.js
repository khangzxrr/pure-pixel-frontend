import http from "../configs/Http";

const findAllBooking = async (status) => {
  const response = await http.get(
    `/photographer/booking/me?limit=999&page=0&status=${status}`,
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

const paidBooking = async (id) => {
  const response = await http.post(`/photographer/booking/${id}/paid`);

  return response.data;
};

const upload = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await http.put(
    `/photographer/booking/${id}/upload`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
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
};
