import { notification } from "antd";
import React, { useContext } from "react";

// Create context for notification API
const NotificationContext = React.createContext();
let notificationApi;
// Custom hook to use the notification API
export const useNotification = () => useContext(NotificationContext);

// Provider to supply the notification API to children components
export const NotificationProvider = ({ children }) => {
  // Get the notification API from antd
  const [api, contextHolder] = notification.useNotification();

  // Helper function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    const trimmedString = string.trim();
    return trimmedString.charAt(0).toUpperCase() + trimmedString.slice(1);
  }

  // Wrapper function for notifications
  notificationApi = (type, message, description, icon, duration, key) => {
    // Open notification with given options
    api[type]({
      message:
        typeof message === "string" ? capitalizeFirstLetter(message) : message,
      description:
        typeof description === "string"
          ? capitalizeFirstLetter(description)
          : description, //can be add react element
      icon: icon ? icon : "", //can be use another icon
      key: key ? key : "", //check update notificate by the same key
      duration: duration ? (duration === "unlimit" ? 0 : duration) : 3, //set the time for notification
    });
  };

  // Provide notificationApi through context
  return (
    <NotificationContext.Provider value={{ notificationApi }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

// Export the notificationApi for use in other files
export { notificationApi };
