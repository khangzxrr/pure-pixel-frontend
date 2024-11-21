import http from "../configs/Http";

const findAllBooking = async (limit, page, status, orderByCreatedAt) => {
  const response = await http.get(
    `/customer/booking/me?limit=${limit}&page=${page}${
      status ? `&status=${status}` : ""
    }&orderByCreatedAt=${orderByCreatedAt}`
  );

  return response.data;
};

const findById = async (bookingId) => {
  const response = await http.get(`/customer/booking/${bookingId}`);

  return response.data;
};

const getBillItems = async (bookingId) => {
  const response = await http.get(
    `/customer/booking/${bookingId}/bill-item?limit=10&page=0`
  );

  return response.data;
};
const reviewBooking = async (bookingId, data) => {
  const response = await http.post(
    `/customer/booking/${bookingId}/review`,
    data
  );

  return response.data;
};

const requestBooking = async (packageId, body) => {
  const response = await http.post(
    `/customer/booking/photoshoot-package/${packageId}/request`,
    body
  );
  return response.data;
};
const downloadAllPhoto = async (bookingId) => {
  const response = await http.get(
    `/customer/booking/${bookingId}/download-all`,
    {
      responseType: "blob",
    }
  );

  return response.data;
};

const reviewBookingByCustomer = async (bookingId, body) => {
  const response = await http.post(
    `/customer/booking/${bookingId}/review`,
    body
  );
  return response.data;
};
export const CustomerBookingApi = {
  findAllBooking,
  findById,
  getBillItems,
  requestBooking,
  reviewBooking,
  downloadAllPhoto,
  reviewBookingByCustomer,
};
