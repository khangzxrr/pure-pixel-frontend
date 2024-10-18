import http from "../configs/Http";

const auth = async () => {
  const response = await http.post("/chat/auth");

  return response.data;
};

const ChatApi = {
  auth,
};

export default ChatApi;
