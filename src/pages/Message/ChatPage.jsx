import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

  const navigate = useNavigate();

  const conversationToUserId = searchParams.get("to");

  useEffect(() => {
    if (!conversationToUserId) return;

    if (!client) return;

    if (conversationToUserId === keycloak.tokenParsed.sub) {
      navigate(-1);
    }

    const channel = client.channel("messaging", {
      members: [keycloak.tokenParsed.sub, conversationToUserId],
    });

    console.log(conversationToUserId);
    console.log(channel);

    setActiveChannel(channel);
  }, [client, conversationToUserId]);

  const filters = {
    type: "messaging",
    members: { $in: [keycloak.tokenParsed.sub] },
  };

  //because you pass null client from ChatClientProvider.jsx when client is not initialized
  //we have to catch null client before render Chat component
  if (!client) return <div>loading chat...</div>;

  return (
    <div className="h-full flex">
      <ChannelList filters={filters} />

      <Channel>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
      </Channel>
    </div>
  );
}
