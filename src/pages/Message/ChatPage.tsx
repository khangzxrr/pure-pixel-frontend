import { useKeycloak } from "@react-keycloak/web";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatApi, {
  type ChatMessage,
  type ChatUser,
  type Conversation,
} from "../../apis/ChatApi";
import { useChatMessages } from "../../components/ChatComponent/ChatProvider";

const HISTORY_PAGE_SIZE = 30;
const CONVERSATION_PAGE_SIZE = 20;

// adds conversations not in the list yet; `first` go in front (a fresh first page), otherwise after
function mergeConversations(
  existing: Conversation[],
  incoming: Conversation[],
  first: boolean,
): Conversation[] {
  const incomingIds = new Set(incoming.map((c) => c.id));
  const rest = existing.filter((c) => !incomingIds.has(c.id));
  return first ? [...incoming, ...rest] : [...rest, ...incoming];
}

function appendMessage(
  messages: ChatMessage[],
  message: ChatMessage,
): ChatMessage[] {
  if (messages.some((existing) => existing.id === message.id)) {
    return messages;
  }
  return [...messages, message];
}

function prependMessages(
  messages: ChatMessage[],
  older: ChatMessage[],
): ChatMessage[] {
  const existingIds = new Set(messages.map((m) => m.id));
  return [...older.filter((m) => !existingIds.has(m.id)), ...messages];
}

function upsertConversationOnMessage(
  conversations: Conversation[],
  message: ChatMessage,
  incrementUnread: boolean,
): Conversation[] {
  const index = conversations.findIndex(
    (conversation) => conversation.id === message.conversationId,
  );
  if (index === -1) {
    return conversations;
  }
  const current = conversations[index];
  const updated: Conversation = {
    ...current,
    lastMessage: message,
    lastMessageAt: message.createdAt,
    unreadCount: incrementUnread
      ? current.unreadCount + 1
      : current.unreadCount,
  };
  return [
    updated,
    ...conversations.slice(0, index),
    ...conversations.slice(index + 1),
  ];
}

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { keycloak } = useKeycloak();
  const me = keycloak.tokenParsed?.sub as string;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);
  const [hasMoreConversations, setHasMoreConversations] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [openConversationId, setOpenConversationId] = useState<string | null>(
    null,
  );
  const [openOtherUser, setOpenOtherUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoaded, setMessagesLoaded] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const messageListRef = useRef<HTMLOListElement | null>(null);
  // the conversation opened last; responses for any other one arrive too late and are dropped
  const activeConversationRef = useRef<string | null>(null);

  useEffect(() => {
    ChatApi.getConversations(0, CONVERSATION_PAGE_SIZE)
      .then((page) => {
        setConversations(page);
        setHasMoreConversations(page.length === CONVERSATION_PAGE_SIZE);
      })
      .catch(() => {})
      .finally(() => setConversationsLoaded(true));
  }, []);

  const loadMoreConversations = async () => {
    setLoadingConversations(true);
    try {
      const page = await ChatApi.getConversations(
        conversations.length,
        CONVERSATION_PAGE_SIZE,
      );
      setConversations((prev) => mergeConversations(prev, page, false));
      setHasMoreConversations(page.length === CONVERSATION_PAGE_SIZE);
    } catch {
      // keep the loaded conversations on failure
    } finally {
      setLoadingConversations(false);
    }
  };

  const openConversation = async (id: string, otherUser: ChatUser) => {
    activeConversationRef.current = id;
    setOpenConversationId(id);
    setOpenOtherUser(otherUser);
    setMessages([]);
    setMessagesLoaded(false);
    setHasMore(false);
    setSendError(false);
    setConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === id
          ? { ...conversation, unreadCount: 0 }
          : conversation,
      ),
    );
    ChatApi.markAsRead(id).catch(() => {});
    try {
      const history = await ChatApi.getMessages(id);
      if (activeConversationRef.current !== id) {
        return;
      }
      setMessages(history);
      setHasMore(history.length === HISTORY_PAGE_SIZE);
    } catch {
      // keep the empty message list on failure
    }
    if (activeConversationRef.current === id) {
      setMessagesLoaded(true);
    }
  };

  useEffect(() => {
    const to = searchParams.get("to");
    if (!to) {
      return;
    }
    if (to === me) {
      navigate(-1);
      return;
    }
    ChatApi.openConversation(to)
      .then((direct) => {
        // the user may have picked another conversation while this was loading
        if (activeConversationRef.current === null) {
          openConversation(direct.id, direct.otherUser);
        }
      })
      .catch(() => {});
    // only react to the initial ?to param, not every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const list = messageListRef.current;
    list?.lastElementChild?.scrollIntoView?.();
  }, [messages, openConversationId]);

  useChatMessages((message) => {
    const isOpen = message.conversationId === openConversationId;
    if (isOpen) {
      setMessages((prev) => appendMessage(prev, message));
      if (message.senderId !== me) {
        ChatApi.markAsRead(message.conversationId).catch(() => {});
      }
    }

    const isInList = conversations.some(
      (conversation) => conversation.id === message.conversationId,
    );
    if (!isInList) {
      ChatApi.getConversations(0, CONVERSATION_PAGE_SIZE)
        .then((page) =>
          setConversations((prev) => mergeConversations(prev, page, true)),
        )
        .catch(() => {});
      return;
    }

    setConversations((prev) =>
      upsertConversationOnMessage(
        prev,
        message,
        !isOpen && message.senderId !== me,
      ),
    );
  });

  const loadOlder = async () => {
    const id = openConversationId;
    if (!id || messages.length === 0) {
      return;
    }
    setLoadingOlder(true);
    try {
      const older = await ChatApi.getMessages(id, {
        beforeId: messages[0].id,
      });
      if (activeConversationRef.current !== id) {
        return;
      }
      setMessages((prev) => prependMessages(prev, older));
      setHasMore(older.length === HISTORY_PAGE_SIZE);
    } catch {
      // keep the current page on failure
    } finally {
      setLoadingOlder(false);
    }
  };

  const send = async () => {
    const trimmed = text.trim();
    const id = openConversationId;
    if (!trimmed || sending || !id) {
      return;
    }
    setSending(true);
    setSendError(false);
    try {
      const message = await ChatApi.sendMessage(id, trimmed);
      setConversations((prev) =>
        upsertConversationOnMessage(prev, message, false),
      );
      if (activeConversationRef.current === id) {
        setMessages((prev) => appendMessage(prev, message));
        setText("");
      }
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  };

  const showEmptyState = conversations.length === 0 && !openConversationId;

  return (
    <div className="flex h-full min-h-0 flex-col md:flex-row">
      <div className="w-full overflow-y-auto border-r md:w-1/3">
        {showEmptyState && <p>Chưa có cuộc trò chuyện nào</p>}
        {conversationsLoaded && (
          <ul aria-label="Cuộc trò chuyện">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <button
                  type="button"
                  aria-current={
                    conversation.id === openConversationId ? "true" : undefined
                  }
                  onClick={() =>
                    openConversation(conversation.id, conversation.otherUser)
                  }
                >
                  <img
                    src={conversation.otherUser.avatar}
                    alt={conversation.otherUser.name}
                  />
                  <span>{conversation.otherUser.name}</span>
                  {conversation.lastMessage && (
                    <span>{conversation.lastMessage.content}</span>
                  )}
                  {conversation.unreadCount > 0 && (
                    <span
                      aria-label={`${conversation.unreadCount} tin nhắn chưa đọc`}
                    >
                      {conversation.unreadCount}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
        {hasMoreConversations && (
          <button
            type="button"
            onClick={loadMoreConversations}
            disabled={loadingConversations}
          >
            Tải thêm cuộc trò chuyện
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col min-h-0">
        {!openConversationId || !openOtherUser ? (
          <p>Chọn một cuộc trò chuyện để bắt đầu</p>
        ) : (
          <>
            <h2>{openOtherUser.name}</h2>
            {hasMore && (
              <button type="button" onClick={loadOlder} disabled={loadingOlder}>
                Tải tin nhắn cũ hơn
              </button>
            )}
            {messagesLoaded && (
              <ol
                aria-label="Tin nhắn"
                ref={messageListRef}
                className="flex-1 overflow-y-auto"
              >
                {messages.map((message) => (
                  <li
                    key={message.id}
                    data-own={message.senderId === me ? "true" : "false"}
                  >
                    {message.content}
                  </li>
                ))}
              </ol>
            )}
            {sendError && <p role="alert">Không gửi được tin nhắn</p>}
            <div className="flex items-end gap-2">
              <textarea
                placeholder="Nhập tin nhắn..."
                value={text}
                onChange={(event) => setText(event.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                aria-label="Gửi"
                disabled={!text.trim() || sending}
                onClick={send}
              >
                Gửi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
