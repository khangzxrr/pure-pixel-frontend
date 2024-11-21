import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io } from "socket.io-client";
import UserService from "../services/Keycloak";

const useNotificationStore = create(
  devtools((set, get) => ({
    isNotificationOpen: false,
    socket: null,
    toggleNotificationModal: () =>
      set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
    closeNotificationModal: () => set({ isNotificationOpen: false }),

    initSocket: () => {
      const socket = io(`${import.meta.env.VITE_AXIOS_BASE_URL}/notification`, {
        autoConnect: true,
        extraHeaders: {
          Authorization: `bearer ${UserService.getToken()}`,
        },
      });

      socket.on("connect", () => {});

      set({ socket });
    },

    joinNotification: (callback) => {
      const socket = get().socket;

      if (socket) {
        socket.on("notification-event", (data) => {
          callback(data);
        });
        socket.emit("join-notification-room");
      }
    },
    leaveNotification: () => {
      const socket = get().socket;

      if (socket) {
        socket.off("notification-event");
        socket.disconnect();
        //clean up
        set({ socket: undefined });
      }
    },
  })),
);

export default useNotificationStore;
