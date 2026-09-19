import { useQuery } from "@tanstack/react-query";
import type { FeatureFlags } from "../apis/FeatureFlagApi";

export function useFeatureFlag(name: keyof FeatureFlags): boolean | undefined {
  const { data, isError } = useQuery({
    queryKey: ["feature-flags"],
    // lazily imported so components that read cached flags (see renderWithProviders'
    // featureFlags option) never need to load the authenticated Http client/Keycloak setup
    queryFn: async () => {
      const { default: FeatureFlagApi } = await import("../apis/FeatureFlagApi");
      return FeatureFlagApi.getFeatureFlags();
    },
    staleTime: Infinity,
  });

  if (isError) {
    return true;
  }

  return data?.[name];
}
