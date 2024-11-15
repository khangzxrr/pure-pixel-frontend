import React, { useEffect, useState } from "react";
import { Chat } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { PacmanLoader } from "react-spinners";
import { useMutation } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";

export default function ChatClientProvider({ user, children }) {
  const [token, setToken] = useState(null);
  const [client, setClient] = useState(null);
  const [, setIsClientReady] = useState(false);

  // Mutation to fetch authentication token
  const { mutate: fetchToken, isLoading: isFetchingToken } = useMutation({
    mutationFn: async () => await ChatApi.auth(),
    onSuccess: (retrievedToken) => {
      setToken(retrievedToken);
    },
    onError: (error) => {
      console.error("Authentication failed:", error);
    },
  });

  // // Trigger token fetch on component mount
  useEffect(() => {
    fetchToken();
  }, []);

  // Initialize the chat client only when the token is available
  useEffect(() => {
    if (token) {
      const chatClient = StreamChat.getInstance(
        process.env.REACT_APP_STREAM_API_KEY,
      );
      chatClient
        .connectUser({ id: user.id, name: user.name }, token)
        .then(() => {
          setClient(chatClient);
          setIsClientReady(true);
        });
    }
  }, [token, user.id, user.name]);

  // Show loading spinner if token is being fetched or client isn't ready

  if (client) {
    return (
      <Chat client={client} theme="str-chat__theme-dark">
        {children}
      </Chat>
    );
  }

  return <div>{children}</div>;
}
