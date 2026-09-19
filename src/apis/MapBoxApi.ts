import http, { externalHttp } from "../configs/Http";
import type { ResponseOf } from "./types";

const BASE_URL = "https://api.mapbox.com/search/geocode/v6";

// the part of a Mapbox Geocoding v6 response the app reads
export type MapboxGeocodeResponse = {
  features: { properties: { full_address: string } }[];
};

const getAddressByCoordinate = async (
  longitude: number,
  latitude: number,
) => {
  const response = await externalHttp.get<MapboxGeocodeResponse>(
    `${BASE_URL}/reverse?longitude=${longitude}&latitude=${latitude}&types=place&language=vi&limit=1&access_token=${
      import.meta.env.VITE_MAPBOX_TOKEN
    }`,
  );
  return response.data;
};

const getPhotoListByCoorddinate = async (
  page: number,
  limit: number,
  longitude: number,
  latitude: number,
  distance: number,
) => {
  const response = await http.get<
    ResponseOf<"PhotoController_getAllPublicPhoto">
  >(
    `/photo/public?limit=${limit}&page=${page}&gps=true&longitude=${longitude}&latitude=${latitude}&distance=${distance}&selling=false`,
  );
  return response.data;
};

const getCoordinateByAddress = async (address: string) => {
  const response = await externalHttp.get<MapboxGeocodeResponse>(
    `${BASE_URL}/forward?q=${encodeURIComponent(
      address,
    )}&country=VN&access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`,
  );
  return response.data;
};

const MapBoxApi = {
  getPhotoListByCoorddinate,
  getAddressByCoordinate,
  getCoordinateByAddress,
};
export default MapBoxApi;
