import { useKeycloak } from "@react-keycloak/web";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import type { ChatMessage } from "../../apis/ChatApi";
import LoadingPage from "../../pages/LoadingPage";

type ChatMessageHandler = (message: ChatMessage) => void;

type ChatContextValue = {
  subscribe: (handler: ChatMessageHandler) => () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

type ChatProviderProps = {
  children?: ReactNode;
};

function ConnectedChatProvider({
  token,
  children,
}: {
  token: string;
  children?: ReactNode;
}) {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Set<ChatMessageHandler>>(new Set());
  const tokenRef = useRef(token);
  tokenRef.current = token;

  useEffect(() => {
    const socket = io(`${import.meta.env.VITE_AXIOS_BASE_URL}/chat`, {
      transports: ["websocket"],
      auth: { token: `bearer ${tokenRef.current}` },
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-chat");
    });

    socket.on("connect_error", () => {
      socket.auth = { token: `bearer ${tokenRef.current}` };
    });

    socket.on("chat-message", (message: ChatMessage) => {
      handlersRef.current.forEach((handler) => handler(message));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.auth = { token: `bearer ${token}` };
    }
  }, [token]);

  const subscribe = (handler: ChatMessageHandler) => {
    handlersRef.current.add(handler);
    return () => {
      handlersRef.current.delete(handler);
    };
  };

  return (
    <ChatContext.Provider value={{ subscribe }}>
      {children}
    </ChatContext.Provider>
  );
}

const ChatProvider = ({ children }: ChatProviderProps) => {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <LoadingPage />;
  }

  if (keycloak.authenticated && keycloak.tokenParsed?.sub && keycloak.token) {
    return (
      <ConnectedChatProvider token={keycloak.token}>
        {children}
      </ConnectedChatProvider>
    );
  }

  return <>{children}</>;
};

export function useChatMessages(handler: ChatMessageHandler): void {
  const context = useContext(ChatContext);
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!context) {
      return;
    }
    return context.subscribe((message) => handlerRef.current(message));
  }, [context]);
}

export default ChatProvider;
