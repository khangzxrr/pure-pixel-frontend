import axios, {
  isAxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import UserService from "../services/Keycloak";

type RequestHeaders = AxiosRequestConfig["headers"];

const api = axios.create({
  baseURL: import.meta.env.VITE_AXIOS_BASE_URL,
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
  (error) => Promise.reject(error),
);

const isUnauthorized = (error: unknown) =>
  isAxiosError(error) && error.response?.status === 401;

// resolves with the whole response, unlike the helpers below
export const getData = async <T = unknown>(
  endpoint: string,
  params: Record<string, unknown> = {},
  headers: RequestHeaders = {},
): Promise<AxiosResponse<T>> => api.get<T>(endpoint, { params, headers });

// rejects with the server response when there is one
export const postData = async <T = unknown>(
  endpoint: string,
  data?: unknown,
  headers: RequestHeaders = {},
): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data, { headers });
    return response.data;
  } catch (error) {
    if (isAxiosError(error) && error.response) {
      throw error.response;
    }
    throw error;
  }
};

// put, patch and delete resolve with undefined on 401 instead of rejecting
export const putData = async <T = unknown>(
  endpoint: string,
  id: string | number,
  data?: unknown,
  headers: RequestHeaders = {},
): Promise<T | undefined> => {
  try {
    const response = await api.put<T>(`${endpoint}/${id}`, data, { headers });
    return response.data;
  } catch (error) {
    if (isUnauthorized(error)) {
      return undefined;
    }
    throw error;
  }
};

export const patchData = async <T = unknown>(
  endpoint: string,
  id: string | number,
  data?: unknown,
  headers: RequestHeaders = {},
): Promise<T | undefined> => {
  try {
    const response = await api.patch<T>(`${endpoint}/${id}`, data, {
      headers,
    });
    return response.data;
  } catch (error) {
    if (isUnauthorized(error)) {
      return undefined;
    }
    throw error;
  }
};

export const deleteData = async <T = unknown>(
  endpoint: string,
  id: string | number,
  data?: unknown,
  headers: RequestHeaders = {},
): Promise<T | undefined> => {
  try {
    const response = await api.delete<T>(`${endpoint}/${id}`, {
      headers,
      data,
    });
    return response.data;
  } catch (error) {
    if (isUnauthorized(error)) {
      return undefined;
    }
    throw error;
  }
};
