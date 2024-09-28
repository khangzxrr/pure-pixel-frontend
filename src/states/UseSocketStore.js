import { message } from "antd";
import { io } from "socket.io-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import UserService from "../services/Keycloak";

const useSocketStore = create(
  devtools((set, get) => ({
    socket: null,
    initSocket: () => {
      const socket = io(process.env.REACT_APP_WEBSOCKET_UPLOAD_PHOTO, {
        autoConnect: true,
        extraHeaders: {
          Authorization: `bearer ${UserService.getToken()}`,
        },
      });

      socket.on("connect", () => {
        console.log("connect websocket");

        if (UserService.hasRole(["photographer"])) {
          get().subcribePhotoProcessNotification();
        }
      });

      set({
        socket,
      });
    },
    subcribePhotoProcessNotification: () => {
      get().socket.emit("join-photo-process-notification-room");
      get().socket.on("finish-process-photos", (data) => {
        message.info({
          content: `Đã xử lý ảnh ${data.title} thành công! Giờ bạn có thể xem và tương tác với ảnh`,
        });
      });
    },
  })),
);

export default useSocketStore;
