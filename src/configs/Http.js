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

// Add interceptor for request
http.interceptors.request.use(
  (config) => {
    if (UserService.isLoggedIn()) {
      const successCallback = () => {
        config.headers.Authorization = `Bearer ${UserService.getToken()}`;

        return Promise.resolve(config);
      };
      return UserService.updateToken(successCallback);
    }
  },
  (error) => {
    console.log("error: ", error);
    return Promise.reject(error);
  },
);

export default http;
