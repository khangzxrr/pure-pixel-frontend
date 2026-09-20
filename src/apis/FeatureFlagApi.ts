import http from "../configs/Http";

// registration mirrors the Keycloak realm "User registration" switch
export type FeatureFlags = { booking: boolean; registration: boolean };

const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const response = await http.get<FeatureFlags>("/feature-flags");
  return response.data;
};

const FeatureFlagApi = { getFeatureFlags };

export default FeatureFlagApi;
