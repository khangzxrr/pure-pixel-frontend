import http, { externalHttp } from "../configs/Http";

const BASE_URL = "https://api.mapbox.com/search/geocode/v6";

const getAddressByCoordinate = async (longitude, latitude) => {
  const response = await externalHttp.get(
    `${BASE_URL}/reverse?longitude=${longitude}&latitude=${latitude}&types=place&language=vi&limit=1&access_token=${
      import.meta.env.VITE_MAPBOX_TOKEN
    }`
  );
  return response.data;
};

const getPhotoListByCoorddinate = async (
  page,
  limit,
  longitude,
  latitude,
  distance
) => {
  const response = await http.get(
    `/photo/public?limit=${limit}&page=${page}&gps=true&longitude=${longitude}&latitude=${latitude}&distance=${distance}&selling=false`
  );
  return response.data;
};

const getCoordinateByAddress = async (address) => {
  const response = await externalHttp.get(
    `${BASE_URL}/forward?q=${encodeURIComponent(
      address
    )}&country=VN&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`
  );
  return response.data;
};

const MapBoxApi = {
  getPhotoListByCoorddinate,
  getAddressByCoordinate,
  getCoordinateByAddress,
};
export default MapBoxApi;
