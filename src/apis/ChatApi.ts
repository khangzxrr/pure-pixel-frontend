import http from "../configs/Http";

export type ChatUser = { id: string; name: string; avatar: string };

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  otherUser: ChatUser;
  lastMessage: ChatMessage | null;
  unreadCount: number;
  lastMessageAt: string;
};

export type DirectConversation = { id: string; otherUser: ChatUser };

const openConversation = async (userId: string): Promise<DirectConversation> => {
  const response = await http.post<DirectConversation>("/chat/conversations", {
    userId,
  });
  return response.data;
};

const getConversations = async (
  skip = 0,
  take = 20,
): Promise<Conversation[]> => {
  const response = await http.get<Conversation[]>("/chat/conversations", {
    params: { skip, take },
  });
  return response.data;
};

const getMessages = async (
  conversationId: string,
  // beforeId: id of the oldest loaded message, only older messages are returned
  options?: { beforeId?: string; take?: number },
): Promise<ChatMessage[]> => {
  const params: { take: number; beforeId?: string } = {
    take: options?.take ?? 30,
  };
  if (options?.beforeId) {
    params.beforeId = options.beforeId;
  }
  const response = await http.get<ChatMessage[]>(
    `/chat/conversations/${conversationId}/messages`,
    { params },
  );
  return response.data;
};

const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<ChatMessage> => {
  const response = await http.post<ChatMessage>(
    `/chat/conversations/${conversationId}/messages`,
    { content },
  );
  return response.data;
};

const markAsRead = async (conversationId: string): Promise<void> => {
  await http.post(`/chat/conversations/${conversationId}/read`);
};

const getUnreadCount = async (): Promise<number> => {
  const response = await http.get<{ count: number }>("/chat/unread-count");
  return response.data.count;
};

const ChatApi = {
  openConversation,
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
};

export default ChatApi;
