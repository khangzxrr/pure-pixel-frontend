import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AppRouter } from "./routers/AppRouter";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import UserService from "./services/Keycloak";
import OneSignal from "react-onesignal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

function App() {
  OneSignal.init({
    appId: "0460263b-9032-44ed-910c-4248b23ecf8e",
    notifyButton: {
      enable: true,
    },
    allowLocalhostAsSecureOrigin: true,
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider
        authClient={UserService.keycloakService}
        initOptions={{
          onLoad: "check-sso",
          silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        }}
        onEvent={async (event, error) => {
          if (event === "onAuthSuccess") {
            console.log(UserService.getTokenParsed());

            const id = UserService.getUserId();
            await OneSignal.login(id);
          }
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
