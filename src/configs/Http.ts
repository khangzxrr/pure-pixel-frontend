import axios, { type InternalAxiosRequestConfig } from "axios";
import UserService from "../services/Keycloak";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// sends the Keycloak access token with every request once the user is signed in
export const authorizeRequest = async (config: InternalAxiosRequestConfig) => {
  if (UserService.isLoggedIn()) {
    config.headers.Authorization = `Bearer ${UserService.getToken()}`;
  }
  return config;
};

export const logRequestError = (label: string) => (error: unknown) => {
  console.log(label, error);
  return Promise.reject(error);
};

// Default Axios instance
const http = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
  timeout: 30000,
  headers: JSON_HEADERS,
});

// Create timeoutHttpClient with dynamic timeout
export const timeoutHttpClient = (timeout = 30000) => {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
    timeout: timeout,
    headers: JSON_HEADERS,
  });

  instance.interceptors.request.use(
    authorizeRequest,
    logRequestError("TimeoutHttpClient error: "),
  );

  return instance;
};

// External HTTP client
export const externalHttp = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: JSON_HEADERS,
});

http.interceptors.request.use(authorizeRequest, logRequestError("HTTP error: "));

export default http;
