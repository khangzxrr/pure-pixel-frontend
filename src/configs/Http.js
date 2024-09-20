import axios from "axios";
import UserService from "../services/Keycloak";

const http = axios.create({
  baseURL: process.env.REACT_APP_AXIOS_BASE_URL,

  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const testHttp = axios.create({
  baseURL: "https://667f9d41f2cb59c38dc94c63.mockapi.io/profiles",

  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use(
  async (config) => {
    if (UserService.isLoggedIn()) {
      await UserService.updateToken();
      config.headers.Authorization = `Bearer ${UserService.getToken()}`;
    }
    return config;
  },
  (error) => {
    console.log("error: ", error);
    return Promise.reject(error);
  }
);

export default http;
