import type { ReactNode } from "react";
import type { FeatureFlags } from "../../apis/FeatureFlagApi";
import { useFeatureFlag } from "../../hooks/useFeatureFlag";

type FeatureGateProps = {
  flag: keyof FeatureFlags;
  fallback?: ReactNode;
  children: ReactNode;
};

export default function FeatureGate({ flag, fallback = null, children }: FeatureGateProps) {
  const enabled = useFeatureFlag(flag);

  return enabled === true ? <>{children}</> : <>{fallback}</>;
}
