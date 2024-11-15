import "stream-chat-react/dist/css/v2/index.css";
import "./ChannelInbox.css";
import { useKeycloak } from "@react-keycloak/web";
import ChatClientProvider from "./ChatClientProvider";
import { ClipLoader, PacmanLoader } from "react-spinners";

const ChatProvider = ({ children }) => {
  const { keycloak, initialized } = useKeycloak();
  console.log("ChatProvider", keycloak.authenticated, keycloak.tokenParsed);

  if (!initialized) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          minHeight: "100vh",
          backgroundColor: "#1f1f1f",
        }}
      >
        {/* <VaraText text="hello" /> */}
        <PacmanLoader />
      </div>
    );
  }

  if (keycloak.authenticated && keycloak.tokenParsed) {
    const user = {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.name,
    };
    console.log("ChatProvider", keycloak.tokenParsed.name);

    return <ChatClientProvider user={user}>{children}</ChatClientProvider>;
  }

  return <div>{children}</div>;
};

export default ChatProvider;
