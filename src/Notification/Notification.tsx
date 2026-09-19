import { notification } from "antd";
import { createContext, useContext, type ReactNode } from "react";

export type NotificationType = "success" | "info" | "warning" | "error";

export type NotificationApi = (
  type: NotificationType,
  message: ReactNode,
  description?: ReactNode,
  // any icon element; defaults to antd's icon for the type
  icon?: ReactNode,
  // seconds, or "unlimit" to keep it open
  duration?: number | "unlimit",
  // notifications sharing a key replace each other
  key?: string,
) => void;

type NotificationContextValue = { notificationApi: NotificationApi };

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);
let notificationApi: NotificationApi | undefined;

export const useNotification = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used inside NotificationProvider");
  }
  return context;
};

function capitalizeFirstLetter(value: string) {
  const trimmed = value.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

const capitalizeText = (value: ReactNode) =>
  typeof value === "string" ? capitalizeFirstLetter(value) : value;

// Provider to supply the notification API to children components
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotification: NotificationApi = (
    type,
    message,
    description,
    icon,
    duration,
    key,
  ) => {
    api[type]({
      message: capitalizeText(message),
      description: capitalizeText(description),
      icon: icon ? icon : "",
      key: key ? key : "",
      duration: duration ? (duration === "unlimit" ? 0 : duration) : 3,
    });
  };
  notificationApi = openNotification;

  return (
    <NotificationContext.Provider value={{ notificationApi: openNotification }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

// Export the notificationApi for use in other files
export { notificationApi };
