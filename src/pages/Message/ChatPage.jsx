import { useKeycloak } from "@react-keycloak/web";
import {
  Channel,
  ChannelHeader,
  ChannelList,
  MessageInput,
  MessageList,
  useChatContext,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";

export default function ChatPage() {
  const { keycloak } = useKeycloak();

  const { client } = useChatContext();

  console.log(keycloak.tokenParsed, client);

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
      </Channel>
    </>
  );
}
