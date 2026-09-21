import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { App as AntdApp, ConfigProvider } from "antd";
import viVN from "antd/es/locale/vi_VN";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotificationProvider } from "../Notification/Notification";
import { antdTheme } from "../theme/antdTheme";
import AntdAppBridge from "../theme/AntdAppBridge";
import type { FeatureFlags } from "../apis/FeatureFlagApi";

type ProviderOptions = {
  // URL the router starts at, e.g. "/photo/123"
  route?: string;
  // route pattern to mount the component under so useParams works, e.g. "/photo/:id"
  path?: string;
  queryClient?: QueryClient;
  // feature flags the app reads from GET /feature-flags, pre-loaded under the ["feature-flags"]
  // query key so layouts never render their loading state; flags not given are on,
  // pass null to leave them unloaded
  featureFlags?: Partial<FeatureFlags> | null;
};

// a fresh client per test: no retries, so failed requests surface immediately
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });
}

// renders with the providers the app sets up in App.jsx (auth is mocked separately, see ./keycloak)
export function renderWithProviders(
  ui: ReactElement,
  {
    route = "/",
    path,
    queryClient = createTestQueryClient(),
    featureFlags = {},
    ...options
  }: ProviderOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  if (featureFlags && queryClient.getQueryData(["feature-flags"]) === undefined) {
    queryClient.setQueryData<FeatureFlags>(["feature-flags"], {
      booking: true,
      registration: true,
      ...featureFlags,
    });
  }

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={viVN} theme={antdTheme}>
          <AntdApp component={false}>
            <AntdAppBridge />
            <NotificationProvider>
            <MemoryRouter
              initialEntries={[route]}
              // opt into v7 behaviour to silence the upgrade warnings in test output
              future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
            >
              {path ? (
                <Routes>
                  <Route path={path} element={children} />
                </Routes>
              ) : (
                children
              )}
            </MemoryRouter>
            </NotificationProvider>
          </AntdApp>
        </ConfigProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
