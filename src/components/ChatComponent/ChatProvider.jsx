import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { useKeycloak } from "@react-keycloak/web";
import ChatClientProvider from "./ChatClientProvider";
import PurePixelLoading from "../Animation/PurePixelLoading";
import LoadingPage from "../../pages/LoadingPage";

const ChatProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <LoadingPage />;
  }

  if (keycloak.authenticated && keycloak.tokenParsed) {
    const user = {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.name,
    };

    return <ChatClientProvider user={user}>{children}</ChatClientProvider>;
  }

  return <div>{children}</div>;
};

export default ChatProvider;
