import axios from "axios";
import UserService from "../services/Keycloak";
const api = axios.create({
  // baseURL: "https://artwork-sharing-platform.id.vn",
  baseURL: process.env.REACT_APP_AXIOS_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (UserService.isLoggedIn()) {
      // Set Authorization header with Bearer token
      config.headers.Authorization = `Bearer ${UserService.getToken()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// Thêm các headers mặc định nếu cần
// api.defaults.headers.common["Authorization"] = "Bearer YOUR_ACCESS_TOKEN";
// Đặt cookies vào tiêu đề yêu cầu (nếu có)

export const getData = async (endpoint, params = {}, headers = {}) => {
  try {
    const response = await api.get(endpoint, { params, headers });
    return response;
  } catch (error) {
    throw error;
  }
};
export const postData = async (endpoint, data, headers = {}) => {
  try {
    const response = await api.post(endpoint, data, { headers });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // window.location.href = "/login";
      throw error.response || error;
    } else {
      throw error.response || error;
    }
  }
};

export const putData = async (endpoint, id, data, headers = {}) => {
  try {
    const response = await api.put(`${endpoint}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    } else {
      throw error;
    }
  }
};
export const patchData = async (endpoint, id, data, headers = {}) => {
  try {
    const response = await api.patch(`${endpoint}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    } else {
      throw error;
    }
  }
};
export const deleteData = async (endpoint, id, data, headers = {}) => {
  try {
    const response = await api.delete(`${endpoint}/${id}`, { headers, data });
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
    } else {
      throw error;
    }
  }
};
