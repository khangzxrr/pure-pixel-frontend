import http from "./../configs/Http";

const getPhotoShootPackageById = async (id) => {
  const response = await http.get(`/photoshoot-package/${id}`);
  return response.data;
};
const requestBookingByCustomer = async (packageId, body) => {
  console.log("packageId", packageId, body);

  const response = await http.post(
    `/customer/booking/photoshoot-package/${packageId}/request`,
    body
  );
  return response.data;
};

const getBookingByCustomer = async (limit, page) => {
  const response = await http.get(`/customer/booking/me?limit=10&page=0`);
  return response.data;
};
const handleRequestByPhotographer = async (bookingId, type) => {
  console.log("packageId", bookingId, type);

  const response = await http.post(
    `/photographer/booking/${bookingId}/${type}`
  );
  return response.data;
};
const PhotoShootApi = {
  getPhotoShootPackageById,
  getBookingByCustomer,
  requestBookingByCustomer,
  handleRequestByPhotographer,
};
export default PhotoShootApi;
