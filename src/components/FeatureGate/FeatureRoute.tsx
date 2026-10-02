import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { FeatureFlags } from "../../apis/FeatureFlagApi";
import { useFeatureFlag } from "../../hooks/useFeatureFlag";
import LoadingPage from "../../pages/LoadingPage";

type FeatureRouteProps = {
  flag: keyof FeatureFlags;
  children: ReactNode;
};

export default function FeatureRoute({ flag, children }: FeatureRouteProps) {
  const enabled = useFeatureFlag(flag);

  if (enabled === undefined) {
    return <LoadingPage />;
  }

  if (enabled === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
