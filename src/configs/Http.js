import axios from "axios";
import UserService from "../services/Keycloak";

const http = axios.create({
  // eslint-disable-next-line no-undef
  baseURL: process.env.REACT_APP_AXIOS_BASE_URL,

  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const externalHttp = axios.create({
  baseURL: "",

  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  async (config) => {
    if (UserService.isLoggedIn()) {
      config.headers.Authorization = `Bearer ${UserService.getToken()}`;
    }
    return Promise.resolve(config);
  },
  (error) => {
    console.log("error: ", error);
    return Promise.reject(error);
  }
);

export default http;
