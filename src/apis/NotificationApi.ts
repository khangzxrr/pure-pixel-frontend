import http from "../configs/Http";
import type { ResponseOf } from "./types";

const getAllNotifactions = async (limit: number, page: number) => {
  const params = {
    limit: String(limit),
    page: String(page),
  };

  const queryString = new URLSearchParams(params).toString();
  const url = `/notification?${queryString}`;
  const response =
    await http.get<ResponseOf<"NotificationController_getAllNotification">>(
      url,
    );
  return response.data;
};

const NotificationApi = {
  getAllNotifactions,
};
export default NotificationApi;
