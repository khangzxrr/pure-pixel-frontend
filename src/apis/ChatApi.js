import http from "../configs/Http";

const auth = async () => {
  try {
    const response = await http.post("/chat/auth");
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const ChatApi = {
  auth,
};

export default ChatApi;
