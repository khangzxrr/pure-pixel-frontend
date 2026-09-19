import http from "../configs/Http";
import type { ResponseOf } from "./types";

const auth = async () => {
  try {
    const response =
      await http.post<ResponseOf<"ChatController_authChatToken">>(
        "/chat/auth",
      );
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const ChatApi = {
  auth,
};

export default ChatApi;
