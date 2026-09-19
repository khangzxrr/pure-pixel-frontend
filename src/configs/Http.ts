import axios from "axios";
import { authorizeRequest, refreshAndRetry } from "../services/tokenRefresh";

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

// re-exported so existing consumers of ./Http keep working
export { authorizeRequest };

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

http.interceptors.request.use(authorizeRequest, logRequestError("HTTP error: "));
http.interceptors.response.use((response) => response, refreshAndRetry(http));

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
  instance.interceptors.response.use(
    (response) => response,
    refreshAndRetry(instance),
  );

  return instance;
};

// External HTTP client
export const externalHttp = axios.create({
  baseURL: "",
  timeout: 30000,
  headers: JSON_HEADERS,
});

export default http;
