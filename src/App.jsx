import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AppRouter } from "./routers/AppRouter";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import UserService from "./services/Keycloak";
import { App as AntdApp, ConfigProvider } from "antd";
import locale from "antd/es/locale/vi_VN"; // Import locale tiếng Việt cho antd
import { antdTheme } from "./theme/antdTheme";
import AntdAppBridge from "./theme/AntdAppBridge";
import { NotificationProvider } from "./Notification/Notification";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import locale tiếng Việt
import ChatProvider from "./components/ChatComponent/ChatProvider";
import OneSignal from "react-onesignal";
import ComThanksModal from "./components/ComThanksModal/ComThanksModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

function App() {
  if (
    !window.location.hostname.toLowerCase().includes("localhost") &&
    !window.location.hostname.toLowerCase().includes("127.0.0.1")
  ) {
    OneSignal.init({
      appId: import.meta.env.VITE_ONE_SIGNAL_APP_ID,
      notifyButton: {
        enable: true,
      },
      allowLocalhostAsSecureOrigin: true,
    });
  }

  dayjs.locale("vi");

  return (
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider
        initOptions={{
          onLoad: "check-sso",
          silentCheckSsoRedirectUri:
            window.location.origin + "/silent-check-sso.html",
        }}
        authClient={UserService.keycloakService}
        onEvent={async (event, error) => {
          if (event === "onAuthSuccess") {
            if (
              !window.location.hostname.toLowerCase().includes("localhost") &&
              !window.location.hostname.toLowerCase().includes("127.0.0.1")
            ) {
              const id = UserService.getUserId();
              await OneSignal.login(id);
            }
          }
        }}
      >
        <ToastContainer />
        {/* the app's only ConfigProvider: locale + the dark token theme for every antd surface */}
        <ConfigProvider locale={locale} theme={antdTheme}>
          <AntdApp component={false}>
            <AntdAppBridge />
            <ComThanksModal />
            <NotificationProvider>
              <ChatProvider>
                <RouterProvider router={AppRouter} />
              </ChatProvider>
            </NotificationProvider>
          </AntdApp>
        </ConfigProvider>
        <ReactQueryDevtools buttonPosition="bottom-left" />
      </ReactKeycloakProvider>
    </QueryClientProvider>
  );
}

export default App;
