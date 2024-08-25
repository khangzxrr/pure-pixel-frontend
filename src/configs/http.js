import axios from "axios";
import Cookies from "js-cookie";
// import toast from "react-toastify";
import { toast } from "react-toastify";

export const getToken = () => {
  if (typeof window === undefined) {
    return null;
  }
  return Cookies.get("auth_token");
};

const http = axios.create({
  baseURL: "http://localhost:8080/",

  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Add interceptor for request
http.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = {
        ...config.headers,
        // Authorization: `Bearer ${token}`,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => {
    console.log("error: ", error);
    return Promise.reject(error);
  }
);

// In your response interceptor
http.interceptors.response.use(
  (response) => {
    // Handle the response as before
    return response;
  },
  (error) => {
    // If the error status is 401 (Unauthorized), redirect to /login
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
      toast.error("Please login to continue");
    }

    return Promise.reject(error);
  }
);

export default http;
