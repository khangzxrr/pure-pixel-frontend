import http from "../configs/Http";
import type { BodyOf, ResponseOf } from "./types";

const closeReport = async (
  reportId: string,
  updateBody: BodyOf<"ManagerReportController_patchUpdateReport">,
) => {
  const response = await http.patch<
    ResponseOf<"ManagerReportController_patchUpdateReport">
  >(`manager/report/${reportId}`, updateBody);
  return response.data;
};
const getBookingDetail = async (bookingId: string) => {
  const response = await http.get<
    ResponseOf<"ManagerBookingController_getBookingDetail">
  >(`manager/booking/${bookingId}`);
  return response.data;
};

const updateBooking = async (
  bookingId: string,
  updateBody: BodyOf<"ManagerBookingController_updateBooking">,
) => {
  const response = await http.patch<
    ResponseOf<"ManagerBookingController_updateBooking">
  >(`manager/booking/${bookingId}`, updateBody);
  return response.data;
};

const ManagerReportApi = {
  getBookingDetail,
  updateBooking,
  closeReport,
};
export default ManagerReportApi;
