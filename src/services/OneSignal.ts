import OneSignal from "react-onesignal";

export const oneSignalClient = OneSignal.init({
  appId: "0460263b-9032-44ed-910c-4248b23ecf8e",
  notifyButton: {
    enable: true,
  },
  allowLocalhostAsSecureOrigin: true,
});
