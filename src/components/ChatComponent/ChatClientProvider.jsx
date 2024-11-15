import React, { useState } from "react";
import { Chat, useCreateChatClient } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { useMutation } from "@tanstack/react-query";

export default function ChatClientProvider({ user, children }) {
  // Mutation to fetch authentication token
  const { mutate: fetchToken } = useMutation({
    mutationFn: async () => await ChatApi.auth(),
    onError: (error) => {
      console.error("Authentication failed:", error);
    },
  });

  const client = useCreateChatClient({
    apiKey: process.env.REACT_APP_STREAM_API_KEY,
    tokenOrProvider: fetchToken,
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
