import http from "../configs/Http";

const photographerFindAllBooking = async () => {
  const response = await http.get("/photographer/booking/me?limit=999&page=0");

  return response.data;
};

export const PhotographerBookingApi = {
  photographerFindAllBooking,
};
