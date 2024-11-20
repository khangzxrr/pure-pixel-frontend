import { message } from "antd";
import { io } from "socket.io-client";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import UserService from "../services/Keycloak";
import useUploadPhotoStore from "./UploadPhotoState";
import { notificationApi } from "../Notification/Notification"; // Import the notificationApi

const useSocketStore = create(
  devtools((set, get) => ({
    socket: null,
    initSocket: () => {
      const socket = io(import.meta.env.VITE_WEBSOCKET_UPLOAD_PHOTO, {
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

      set({ socket });
    },
    subcribePhotoProcessNotification: () => {
      const socket = get().socket;

      if (socket) {
        socket.emit("join-photo-process-notification-room");

        socket.on("finish-process-photos", (data) => {
          console.log(
            "finish-process-photos",
            data,
            useUploadPhotoStore.getState(),
          );

          // message.info({
          //   content: `Đã xử lý ảnh ${data.title} thành công! Giờ bạn có thể xem và tương tác với ảnh`,
          // });
          notificationApi(
            "success",
            "Xử lý ảnh thành công",
            `Đã xử lý ảnh ${data.title} thành công! Giờ bạn có thể xem và tương tác với ảnh`,
            "",
            "unlimit",
            "finish-process-photos",
          );
          // Access the function dynamically
          useUploadPhotoStore
            .getState()
            .updatePhotoPropertyById(data.id, "status", "parsed");
          useUploadPhotoStore
            .getState()
            .updatePhotoPropertyById(data.id, "percent", 100);
        });
      }
    },
  })),
);

export default useSocketStore;
