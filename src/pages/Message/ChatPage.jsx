import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  Thread,
  useChatContext,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

export default function ChatPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const { keycloak } = useKeycloak();

  const { client, setActiveChannel } = useChatContext();

  const conversationToUserId = searchParams.get("to");

  useEffect(() => {
    if (!conversationToUserId) return;

    if (!client) return;

    const channel = client.channel("messaging", {
      members: [keycloak.tokenParsed.sub, conversationToUserId],
    });

    setActiveChannel(channel);
  }, [client, conversationToUserId]);

  const filters = {
    type: "messaging",
    members: { $in: [keycloak.tokenParsed.sub] },
  };

  return (
    <>
      <ChannelList filters={filters} />

      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </>
  );
}
