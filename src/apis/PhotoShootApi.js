import http from "./../configs/Http";

const getPhotoShootPackageById = async (id) => {
  const response = await http.get(`/photoshoot-package/${id}`);
  return response.data;
};

const getBookingByCustomer = async (limit, page) => {
  const response = await http.get(`/customer/booking/me?limit=10&page=0`);
  return response.data;
};
const handleRequestByPhotographer = async (bookingId, type) => {
  const response = await http.post(
    `/photographer/booking/${bookingId}/${type}`,
  );
  return response.data;
};
const getBookingDetail = async (bookingId) => {
  const response = await http.get(`/photographer/booking/${bookingId}`);
  return response.data;
};
const updateBooking = async (bookingId, data) => {
  const response = await http.patch(`/photographer/booking/${bookingId}`, data);
  return response.data;
};
const uploadBookingPhoto = async (bookingId, file, onUploadProgress) => {
  //FUCK AXIOS
  //waste me 2 hour just for a fucking upload feature???
  //using the RAW axios instead of modified one, or you will get CORS
  //
  const formData = new FormData();
  formData.append("file", file);
  const response = await http.put(
    `/photographer/booking/${bookingId}/upload/v2`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    },
  );

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
