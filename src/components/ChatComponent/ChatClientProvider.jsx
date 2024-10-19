import { Chat, useCreateChatClient } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";

export default function ChatClientProvider({ user, children }) {
  const client = useCreateChatClient({
    apiKey: "xhwsccp3ptxd",
    tokenOrProvider: ChatApi.auth,
    userData: user,
  });

  if (!client) {
    return <div>stream chat initialing...</div>;
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      {children}
    </Chat>
  );
}
