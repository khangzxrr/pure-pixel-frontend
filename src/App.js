import React from "react";
import { ReactKeycloakProvider } from "@react-keycloak/web";
import { AppRouter } from "./routers/AppRouter";
import { RouterProvider } from "react-router-dom";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer } from "react-toastify";
import UserService from "./services/Keycloak";
import { ConfigProvider } from "antd";
import locale from "antd/es/locale/vi_VN"; // Import locale tiếng Việt cho antd
import { NotificationProvider } from "./Notification/Notification";
import dayjs from "dayjs";
import "dayjs/locale/vi"; // Import locale tiếng Việt
import useSocketStore from "./states/UseSocketStore";
import ChatProvider from "./components/ChatComponent/ChatProvider";
import OneSignal from "react-onesignal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 10,
    },
  },
});

function App() {
  const { initSocket } = useSocketStore();

  OneSignal.init({
    appId: "0460263b-9032-44ed-910c-4248b23ecf8e",
    notifyButton: {
      enable: true,
    },
    allowLocalhostAsSecureOrigin: true,
  }).catch((e) => {
    console.log(e);
  });

  dayjs.locale("vi");
  return (
    <QueryClientProvider client={queryClient}>
      <ReactKeycloakProvider
        initOptions={{
          onLoad: "check-sso",
        }}
        authClient={UserService.keycloakService}
        onEvent={async (event, error) => {
          if (event === "onAuthSuccess") {
            // const id = UserService.getUserId();

            initSocket();

            // await OneSignal.login(id);
          }
        }}
      >
        <ToastContainer />
        <ConfigProvider locale={locale}>
          <NotificationProvider>
            <ChatProvider>
              <RouterProvider router={AppRouter} />
            </ChatProvider>
          </NotificationProvider>
        </ConfigProvider>
        <ReactQueryDevtools buttonPosition="bottom-right" />
      </ReactKeycloakProvider>
    </QueryClientProvider>
  );
}

export default App;
