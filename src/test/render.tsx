import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { ConfigProvider } from "antd";
import viVN from "antd/es/locale/vi_VN";
import type { ReactElement, ReactNode } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { NotificationProvider } from "../Notification/Notification";

type ProviderOptions = {
  // URL the router starts at, e.g. "/photo/123"
  route?: string;
  // route pattern to mount the component under so useParams works, e.g. "/photo/:id"
  path?: string;
  queryClient?: QueryClient;
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
    ...options
  }: ProviderOptions & Omit<RenderOptions, "wrapper"> = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={viVN}>
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
        </ConfigProvider>
      </QueryClientProvider>
    );
  }

  return { queryClient, ...render(ui, { wrapper: Wrapper, ...options }) };
}
