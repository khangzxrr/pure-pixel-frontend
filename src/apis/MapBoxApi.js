import externalHttp from "../configs/Http";

const BASE_URL = "https://api.mapbox.com/search/geocode/v6";

const getAddressByCoordinate = async (longitude, latitude) => {
  console.log("getAddressByCoordinate", longitude, latitude);

  const response = await externalHttp.get(
    `${BASE_URL}/reverse?longitude=${longitude}&latitude=${latitude}&types=place&language=vi&limit=1&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  );
  return response.data;
};
// const geocodeUrl = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(address)}&country=VN&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`;

const getCoordinateByAddress = async (address) => {
  const response = await externalHttp.get(
    `${BASE_URL}/forward?q=${encodeURIComponent(
      address
    )}&country=VN&access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`
  );
  return response.data;
};

const MapBoxApi = { getAddressByCoordinate, getCoordinateByAddress };
export default MapBoxApi;
