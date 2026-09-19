import http from "../configs/Http";

export type FeatureFlags = { booking: boolean };

const getFeatureFlags = async (): Promise<FeatureFlags> => {
  const response = await http.get<FeatureFlags>("/feature-flags");
  return response.data;
};

const FeatureFlagApi = { getFeatureFlags };

export default FeatureFlagApi;
