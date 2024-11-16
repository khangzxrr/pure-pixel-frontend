import React from "react";
import { Chat, useCreateChatClient } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";

export default function ChatClientProvider({ user, children }) {
  const client = useCreateChatClient({
    apiKey: process.env.REACT_APP_STREAM_API_KEY,
    tokenOrProvider: ChatApi.auth,
    userData: { id: user.id },
  });

  if (!client) {
    return <div>{children}</div>;
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      {children}
    </Chat>
  );
}
