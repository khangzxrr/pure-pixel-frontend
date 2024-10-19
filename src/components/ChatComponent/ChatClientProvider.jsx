import { Chat, useCreateChatClient } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { PacmanLoader } from "react-spinners";

export default function ChatClientProvider({ user, children }) {
  const client = useCreateChatClient({
    apiKey: "xhwsccp3ptxd",
    tokenOrProvider: ChatApi.auth,
    userData: user,
  });

  if (!client) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          justifyItems: "center",
          alignItems: "center",
          textAlign: "center",
          minHeight: "100vh",
        }}
      >
        <PacmanLoader />
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      {children}
    </Chat>
  );
}
