import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import UserService from "./Keycloak";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

// sends the Keycloak access token with every request once the user is signed in,
// refreshing it first when it is close to expiring
export const authorizeRequest = async (
  config: InternalAxiosRequestConfig,
): Promise<InternalAxiosRequestConfig> => {
  if (!UserService.isLoggedIn()) {
    return config;
  }
  await UserService.updateToken();
  config.headers.Authorization = `Bearer ${UserService.getToken()}`;
  return config;
};

// shared in-flight refresh promise so concurrent 401s only trigger one refresh
let refreshPromise: Promise<boolean | undefined> | undefined;

export const resetTokenRefreshState = () => {
  refreshPromise = undefined;
};

export const refreshAndRetry =
  (instance: AxiosInstance) =>
  async (error: unknown): Promise<AxiosResponse> => {
    if (
      !axios.isAxiosError(error) ||
      error.response?.status !== 401 ||
      !error.config ||
      error.config._retry ||
      !UserService.isLoggedIn()
    ) {
      return Promise.reject(error);
    }

    error.config._retry = true;

    if (!refreshPromise) {
      refreshPromise = UserService.forceRefreshToken().finally(() => {
        refreshPromise = undefined;
      });
    }
    const refreshed = await refreshPromise;

    if (!refreshed) {
      return Promise.reject(error);
    }

    error.config.headers.Authorization = `Bearer ${UserService.getToken()}`;
    return instance(error.config);
  };

export const attachTokenRefresh = (instance: AxiosInstance): AxiosInstance => {
  instance.interceptors.request.use(authorizeRequest);
  instance.interceptors.response.use(
    (response) => response,
    refreshAndRetry(instance),
  );
  return instance;
};
