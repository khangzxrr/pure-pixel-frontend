import http from "../configs/Http";

const findAllBooking = async (limit, page, status) => {
  const response = await http.get(
    `/customer/booking/me?limit=${limit}&page=${page}${
      status ? `&status=${status}` : ""
    }`
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
  console.log("packageId", packageId, body);

  const response = await http.post(
    `/customer/booking/photoshoot-package/${packageId}/request`,
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
};
