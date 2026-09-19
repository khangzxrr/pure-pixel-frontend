import type { AxiosRequestConfig } from "axios";
import http from "./../configs/Http";
import type { BodyOf, ResponseOf } from "./types";

const getPhotoShootPackageById = async (id: string) => {
  const response = await http.get<
    ResponseOf<"PhotoShootPackageController_findPhotoshootPackageById">
  >(`/photoshoot-package/${id}`);
  return response.data;
};

// limit and page are ignored: the first 10 bookings are always requested
const getBookingByCustomer = async (_limit?: number, _page?: number) => {
  const response = await http.get<
    ResponseOf<"CustomerBookingController_findAllBooking">
  >(`/customer/booking/me?limit=10&page=0`);
  return response.data;
};
const handleRequestByPhotographer = async (
  bookingId: string,
  type: "accept" | "deny",
) => {
  const response = await http.post<
    ResponseOf<"PhotographerBookingController_acceptBooking">
  >(`/photographer/booking/${bookingId}/${type}`);
  return response.data;
};
const getBookingDetail = async (bookingId: string) => {
  const response = await http.get<
    ResponseOf<"PhotographerBookingController_getBookingDetail">
  >(`/photographer/booking/${bookingId}`);
  return response.data;
};
const updateBooking = async (
  bookingId: string,
  data: BodyOf<"PhotographerBookingController_updateBooking">,
) => {
  const response = await http.patch<
    ResponseOf<"PhotographerBookingController_updateBooking">
  >(`/photographer/booking/${bookingId}`, data);
  return response.data;
};
const uploadBookingPhoto = async (
  bookingId: string,
  file: Blob,
  onUploadProgress?: AxiosRequestConfig["onUploadProgress"],
) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await http.put<
    ResponseOf<"PhotographerBookingController_filesystemUpload">
  >(`/photographer/booking/${bookingId}/upload/v2`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
};
const PhotoShootApi = {
  getPhotoShootPackageById,
  getBookingByCustomer,
  handleRequestByPhotographer,
  getBookingDetail,
  uploadBookingPhoto,
  updateBooking,
};
export default PhotoShootApi;
