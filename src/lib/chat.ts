export type ChatSender = "buyer" | "garage";

export type ChatMessage = {
  id: string;
  sender: ChatSender;
  senderName: string;
  text: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  garageId: string;
  garageName: string;
  garagePhone: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "cgd_conversations_v1";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getConversations(): Conversation[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Conversation[];
    return parsed.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  } catch {
    return [];
  }
}

export function saveConversations(conversations: Conversation[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

export function createConversation(input: {
  listingId: string;
  listingTitle: string;
  garageId: string;
  garageName: string;
  garagePhone: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  text: string;
}) {
  const conversations = getConversations();

  const conversationId = uid();
  const now = new Date().toISOString();

  const newConversation: Conversation = {
    id: conversationId,
    listingId: input.listingId,
    listingTitle: input.listingTitle,
    garageId: input.garageId,
    garageName: input.garageName,
    garagePhone: input.garagePhone,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail,
    buyerPhone: input.buyerPhone,
    updatedAt: now,
    messages: [
      {
        id: uid(),
        sender: "buyer",
        senderName: input.buyerName,
        text: input.text,
        createdAt: now,
      },
    ],
  };

  saveConversations([newConversation, ...conversations]);
  return conversationId;
}

export function addMessage(
  conversationId: string,
  payload: {
    sender: ChatSender;
    senderName: string;
    text: string;
  }
) {
  const conversations = getConversations();
  const now = new Date().toISOString();

  const updated = conversations.map((conversation) => {
    if (conversation.id !== conversationId) return conversation;

    return {
      ...conversation,
      updatedAt: now,
      messages: [
        ...conversation.messages,
        {
          id: uid(),
          sender: payload.sender,
          senderName: payload.senderName,
          text: payload.text,
          createdAt: now,
        },
      ],
    };
  });

  saveConversations(updated);
}

export function getConversationById(id: string) {
  return getConversations().find((c) => c.id === id) ?? null;
}