import http from "../configs/Http";
import type { BodyOf, QueryOf, ResponseOf } from "./types";

type BookingQuery = QueryOf<"CustomerBookingController_findAllBooking">;

const findAllBooking = async (
  limit: number,
  page: number,
  status: BookingQuery["status"] | "" | null,
  orderByCreatedAt: BookingQuery["orderByCreatedAt"],
) => {
  const response = await http.get<
    ResponseOf<"CustomerBookingController_findAllBooking">
  >(
    `/customer/booking/me?limit=${limit}&page=${page}${
      status ? `&status=${status}` : ""
    }&orderByCreatedAt=${orderByCreatedAt}`,
  );

  return response.data;
};

const findById = async (bookingId: string) => {
  const response = await http.get<
    ResponseOf<"CustomerBookingController_getBookingId">
  >(`/customer/booking/${bookingId}`);

  return response.data;
};

const getBillItems = async (bookingId: string) => {
  const response = await http.get<
    ResponseOf<"CustomerBookingController_findAllBookingBillItems">
  >(`/customer/booking/${bookingId}/bill-item?limit=10&page=0`);

  return response.data;
};
const reviewBooking = async (
  bookingId: string,
  data: BodyOf<"CustomerBookingController_createReview">,
) => {
  const response = await http.post<
    ResponseOf<"CustomerBookingController_createReview">
  >(`/customer/booking/${bookingId}/review`, data);

  return response.data;
};

const requestBooking = async (
  packageId: string,
  body: BodyOf<"CustomerBookingController_requestBooking">,
) => {
  const response = await http.post<
    ResponseOf<"CustomerBookingController_requestBooking">
  >(`/customer/booking/photoshoot-package/${packageId}/request`, body);
  return response.data;
};
const downloadAllPhoto = async (bookingId: string) => {
  const response = await http.get<Blob>(
    `/customer/booking/${bookingId}/download-all`,
    {
      responseType: "blob",
    },
  );

  return response.data;
};

const reviewBookingByCustomer = async (
  bookingId: string,
  body: BodyOf<"CustomerBookingController_createReview">,
) => {
  const response = await http.post<
    ResponseOf<"CustomerBookingController_createReview">
  >(`/customer/booking/${bookingId}/review`, body);
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
