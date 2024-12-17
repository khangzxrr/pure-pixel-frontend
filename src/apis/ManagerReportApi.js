import http from "../configs/Http";

const closeReport = async (reportId, updateBody) => {
  const response = await http.patch(`manager/report/${reportId}`, updateBody);
  return response.data;
};
const getBookingDetail = async (bookingId) => {
  const response = await http.get(`manager/booking/${bookingId}`);
  return response.data;
};

const updateBooking = async (bookingId, updateBody) => {
  const response = await http.patch(`manager/booking/${bookingId}`, updateBody);
  return response.data;
};

const ManagerReportApi = {
  getBookingDetail,
  updateBooking,
  closeReport,
};
export default ManagerReportApi;
