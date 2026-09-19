import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { io, type Socket } from "socket.io-client";

type NotificationState = {
  isNewNotification: boolean;
  isNotificationOpen: boolean;
  socket: Socket | null;
  toggleNotificationModal: () => void;
  closeNotificationModal: () => void;
  setIsNotification: (noti: boolean) => void;
  initSocket: (token: string | undefined) => void;
};

const useNotificationStore = create<NotificationState>()(
  devtools((set) => ({
    isNewNotification: true,
    isNotificationOpen: false,
    socket: null,
    toggleNotificationModal: () =>
      set((state) => ({ isNotificationOpen: !state.isNotificationOpen })),
    closeNotificationModal: () => set({ isNotificationOpen: false }),

    setIsNotification: (noti) => set({ isNewNotification: noti }),

    initSocket: (token) => {
      const socket = io(`${import.meta.env.VITE_AXIOS_BASE_URL}/notification`, {
        autoConnect: true,
        transports: ["websocket"],
        auth: {
          token: `bearer ${token}`,
        },
      });

      socket.on("connect", () => {
        socket.emit("join-notification-room");
      });

      socket.on("disconnect", () => {});

      set({ socket });
    },

    // leaveNotification: () => {
    //   const socket = get().socket;
    //
    //   if (socket) {
    //     socket.off("notification-event");
    //     socket.disconnect();
    //     //clean up
    //     set({ socket: undefined });
    //   }
    // },
  }))
);

export default useNotificationStore;
