import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AppRouter } from "./routers/AppRouter";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import UserService from "./services/Keycloak";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider
        authClient={UserService.keycloakService}
        initOptions={{
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        }}
      >
        <ToastContainer />
        <RouterProvider router={AppRouter} />
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </ReactKeycloakProvider>
    </QueryClientProvider>
  );
}

export default App;
