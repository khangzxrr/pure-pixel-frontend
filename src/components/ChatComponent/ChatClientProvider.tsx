import type { ReactNode } from "react";
import { Chat, useCreateChatClient } from "stream-chat-react";
import ChatApi from "../../apis/ChatApi";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";

export type ChatUser = {
  id: string;
  name?: string;
};

type ChatClientProviderProps = {
  user: ChatUser;
  children?: ReactNode;
};

// ChatApi.auth resolves undefined when the request fails; stream-chat needs a token or a rejection
export const chatTokenProvider = async () => {
  const token = await ChatApi.auth();
  if (!token) {
    throw new Error("Chat token unavailable");
  }
  return token;
};

export default function ChatClientProvider({
  user,
  children,
}: ChatClientProviderProps) {
  const client = useCreateChatClient({
    apiKey: import.meta.env.VITE_STREAM_API_KEY,
    tokenOrProvider: chatTokenProvider,
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
