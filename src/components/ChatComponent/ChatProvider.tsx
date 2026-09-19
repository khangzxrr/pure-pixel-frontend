import type { ReactNode } from "react";
import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { useKeycloak } from "@react-keycloak/web";
import ChatClientProvider from "./ChatClientProvider";
import LoadingPage from "../../pages/LoadingPage";

type ChatProviderProps = {
  children?: ReactNode;
};

const ChatProvider = ({ children }: ChatProviderProps) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <LoadingPage />;
  }

  // a Keycloak access token always carries the subject; the chat user needs it as id
  if (keycloak.authenticated && keycloak.tokenParsed?.sub) {
    const user = {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.name,
    };

    return <ChatClientProvider user={user}>{children}</ChatClientProvider>;
  }

  return <div>{children}</div>;
};

export default ChatProvider;
