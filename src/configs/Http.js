import axios from "axios";
import UserService from "../services/Keycloak";

// Default Axios instance
const http = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Create timeoutHttpClient with dynamic timeout
export const timeoutHttpClient = (timeout = 30000) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
    timeout: timeout,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  // Add the same interceptors as the `http` client
  instance.interceptors.request.use(
    async (config) => {
      if (UserService.isLoggedIn()) {
        config.headers.Authorization = `Bearer ${UserService.getToken()}`;
      }
      return Promise.resolve(config);
    },
    (error) => {
      console.log("TimeoutHttpClient error: ", error);
      return Promise.reject(error);
    }
  );

  return instance;
};

// External HTTP client
export const externalHttp = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Interceptors for the default `http` client
http.interceptors.request.use(
  async (config) => {
    if (UserService.isLoggedIn()) {
      config.headers.Authorization = `Bearer ${UserService.getToken()}`;
    }
    return Promise.resolve(config);
  },
  (error) => {
    console.log("HTTP error: ", error);
    return Promise.reject(error);
  }
);

export default http;
