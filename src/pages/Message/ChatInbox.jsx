import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useState } from "react";
import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  useCreateChatClient,
  Window,
} from "stream-chat-react";
import "stream-chat-react/dist/css/v2/index.css";
import ChatApi from "../../apis/ChatApi";
import "./ChatInbox.css";

export default function ChatPage() {
  const { initialized, keycloak } = useKeycloak();
  const [channel, setChannel] = useState();

  console.log(keycloak.tokenParsed);

  const apiKey = "xhwsccp3ptxd";

  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: ChatApi.auth,
    userData: {
      id: "a5a43960-42fe-4d09-bc94-ad7d9866b320",
    },
  });

  useEffect(() => {
    if (!client || !initialized) return;

    const channel = client.channel("messaging", "iqwjdqidjwiqdw", {
      image: "https://getstream.io/random_png/?name=react",
      name: "Talk about React3",
      members: [keycloak.tokenParsed.sub],
    });

    setChannel(channel);
  }, [client, initialized]);

  if (!initialized || !client) {
    return <div>loading...</div>;
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      <ChannelList />
      <Channel channel={channel}>
        <Window>
          <ChannelHeader />
          <MessageList />
          <MessageInput />
        </Window>
        <Thread />
      </Channel>
    </Chat>
  );
}
