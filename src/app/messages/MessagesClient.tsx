"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Send, Mail, Phone, Circle, ArrowLeft } from "lucide-react";

export type UiMessage = {
  id: string;
  senderType: string;
  senderName: string;
  content: string;
  createdAt: string | null;
};

export type UiConversation = {
  id: string;
  listingId: string | null;
  garageId: string | null;
  listingTitle: string;
  garageName: string;
  garageAvatarUrl?: string | null;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string | null;
  buyerAvatarUrl?: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  buyerUnreadCount?: number;
  proUnreadCount?: number;
  messages: UiMessage[];
};

function formatMessageTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatSidebarTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function getLastMessage(conversation: UiConversation) {
  if (!conversation.messages?.length) return null;
  return conversation.messages[conversation.messages.length - 1];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({
  src,
  alt,
  initials,
  size = "md",
}: {
  src?: string | null;
  alt: string;
  initials: string;
  size?: "md" | "lg";
}) {
  const sizeClass = size === "lg" ? "h-11 w-11 text-sm" : "h-10 w-10 text-xs";

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    );
  }

  return (
    <div
      className={`grid ${sizeClass} shrink-0 place-items-center rounded-full bg-slate-900 font-semibold text-white`}
    >
      {initials}
    </div>
  );
}

export default function MessagesClient({
  initialConversations = [],
}: {
  initialConversations?: UiConversation[];
}) {
  const router = useRouter();

  const [conversations, setConversations] =
    useState<UiConversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string>(
    initialConversations?.[0]?.id ?? ""
  );
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return conversations;

    return conversations.filter((conversation) => {
      const lastMessage = getLastMessage(conversation);

      return (
        conversation.listingTitle.toLowerCase().includes(term) ||
        conversation.garageName.toLowerCase().includes(term) ||
        conversation.buyerName.toLowerCase().includes(term) ||
        (lastMessage?.content || "").toLowerCase().includes(term)
      );
    });
  }, [conversations, search]);

  const activeConversation = useMemo(
    () =>
      filteredConversations.find((c) => c.id === activeId) ??
      conversations.find((c) => c.id === activeId) ??
      null,
    [conversations, filteredConversations, activeId]
  );

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce(
      (sum, conversation) => sum + (conversation.buyerUnreadCount ?? 0),
      0
    );
  }, [conversations]);

  async function markConversationAsRead(conversationId: string) {
    try {
      await fetch("/api/messages/buyer/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId }),
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, buyerUnreadCount: 0 }
            : conversation
        )
      );

      router.refresh();
    } catch {
      console.error("Impossible de marquer la conversation comme lue.");
    }
  }

  async function openConversation(conversationId: string) {
    setActiveId(conversationId);
    setMobileView("chat");
    await markConversationAsRead(conversationId);
  }

  useEffect(() => {
    if (!activeId) return;

    const current = conversations.find((conversation) => conversation.id === activeId);
    if (current && (current.buyerUnreadCount ?? 0) > 0) {
      markConversationAsRead(activeId);
    }
  }, [activeId, conversations]);

  async function sendMessage() {
    if (!activeConversation || !text.trim() || sending) return;

    setSending(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/messages/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          content: text.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Impossible d’envoyer le message.");
        return;
      }

      const newMessage: UiMessage = {
        id: data.message.id,
        senderType: data.message.senderType,
        senderName: data.message.senderName,
        content: data.message.content,
        createdAt: data.message.createdAt,
      };

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === activeConversation.id
            ? {
                ...conversation,
                updatedAt: newMessage.createdAt,
                buyerUnreadCount: 0,
                proUnreadCount: (conversation.proUnreadCount ?? 0) + 1,
                messages: [...conversation.messages, newMessage],
              }
            : conversation
        )
      );

      setText("");
      router.refresh();
    } catch {
      setErrorMessage("Erreur réseau.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-white text-slate-900">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Compte particulier</p>

            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
                Messages
              </h1>

              {totalUnreadCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  {totalUnreadCount}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Retrouvez vos échanges avec les vendeurs et suivez vos conversations.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une annonce, un vendeur, un message..."
                className="w-full min-w-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="grid min-h-[650px] lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside
            className={`border-slate-200 bg-white lg:border-r ${
              mobileView === "chat" ? "hidden lg:block" : "block"
            }`}
          >
            <div className="divide-y divide-slate-100">
              {filteredConversations.length ? (
                filteredConversations.map((conversation) => {
                  const isActive = activeId === conversation.id;
                  const lastMessage = getLastMessage(conversation);
                  const initials = getInitials(conversation.garageName) || "V";
                  const unreadCount = conversation.buyerUnreadCount ?? 0;

                  return (
                    <button
                      key={conversation.id}
                      type="button"
                      onClick={() => openConversation(conversation.id)}
                      className={
                        isActive
                          ? "flex w-full items-start gap-3 border-l-2 border-orange-500 bg-orange-50 px-4 py-4 text-left sm:gap-4 sm:px-5 sm:py-5"
                          : "flex w-full items-start gap-3 border-l-2 border-transparent px-4 py-4 text-left transition hover:bg-slate-50 sm:gap-4 sm:px-5 sm:py-5"
                      }
                    >
                      {conversation.garageAvatarUrl ? (
                        <img
                          src={conversation.garageAvatarUrl}
                          alt={conversation.garageName}
                          className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                          {initials}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {conversation.garageName}
                              </p>

                              {unreadCount > 0 ? (
                                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                  {unreadCount}
                                </span>
                              ) : null}
                            </div>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {conversation.listingTitle || "Annonce"}
                            </p>
                          </div>

                          <span className="shrink-0 text-xs text-slate-400">
                            {formatSidebarTime(lastMessage?.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-sm text-slate-600">
                          {lastMessage
                            ? `${lastMessage.senderName} : ${lastMessage.content}`
                            : "Aucun message"}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-8 text-sm text-slate-500 sm:px-5">
                  Aucune conversation pour le moment.
                </div>
              )}
            </div>
          </aside>

          <main
            className={`min-w-0 bg-white ${
              mobileView === "list" ? "hidden lg:block" : "block"
            }`}
          >
            {activeConversation ? (
              <div className="flex h-full flex-col">
                <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="mb-4 lg:hidden">
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 transition hover:text-orange-600"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Retour aux conversations
                    </button>
                  </div>

                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Circle className="h-2.5 w-2.5 shrink-0 fill-current text-emerald-500" />
                        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Conversation active
                        </span>
                      </div>

                      <h2 className="mt-2 text-lg font-semibold text-slate-900 sm:text-[22px]">
                        {activeConversation.listingTitle || "Annonce"}
                      </h2>

                      <p className="mt-2 text-sm text-slate-600">
                        Conversation avec {activeConversation.garageName}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 text-sm text-slate-600">
                      <div className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>{activeConversation.garageName}</span>
                      </div>

                      {activeConversation.buyerPhone ? (
                        <div className="inline-flex items-center gap-2">
                          <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                          <span>{activeConversation.buyerPhone}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto bg-white px-4 py-5 sm:px-6 sm:py-6">
                  {activeConversation.messages.length ? (
                    activeConversation.messages.map((message) => {
                      const mine = message.senderType === "buyer";
                      const garageInitials = getInitials(activeConversation.garageName) || "V";
                      const buyerInitials = getInitials(activeConversation.buyerName) || "A";

                      return (
                        <div
                          key={message.id}
                          className={mine ? "flex justify-end" : "flex justify-start"}
                        >
                          <div
                            className={`flex max-w-[92%] items-end gap-2 sm:max-w-[78%] sm:gap-3 ${
                              mine ? "ml-auto flex-row-reverse" : "flex-row"
                            }`}
                          >
                            {mine ? (
                              <Avatar
                                src={activeConversation.buyerAvatarUrl}
                                alt={activeConversation.buyerName}
                                initials={buyerInitials}
                              />
                            ) : (
                              <Avatar
                                src={activeConversation.garageAvatarUrl}
                                alt={activeConversation.garageName}
                                initials={garageInitials}
                              />
                            )}

                            <div className="min-w-0">
                              <div
                                className={`mb-1 flex items-center gap-2 text-[11px] text-slate-400 sm:text-xs ${
                                  mine ? "justify-end" : "justify-start"
                                }`}
                              >
                                <span className="font-medium text-slate-500">
                                  {message.senderName}
                                </span>
                                <span>{formatMessageTime(message.createdAt)}</span>
                              </div>

                              <div
                                className={
                                  mine
                                    ? "break-words rounded-2xl rounded-tr-md bg-orange-500 px-3 py-2.5 text-sm leading-6 text-white sm:px-4 sm:py-3"
                                    : "break-words rounded-2xl rounded-tl-md bg-slate-100 px-3 py-2.5 text-sm leading-6 text-slate-900 sm:px-4 sm:py-3"
                                }
                              >
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-sm text-slate-500">
                      Aucun message dans cette conversation.
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-3">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={4}
                      className="w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      placeholder="Écrire un message..."
                    />

                    {errorMessage ? (
                      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {errorMessage}
                      </div>
                    ) : null}

                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={sending}
                        className="inline-flex h-11 items-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Send className="h-4 w-4" />
                        {sending ? "Envoi..." : "Envoyer"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid h-full place-items-center px-6 py-20">
                <div className="max-w-md text-center">
                  <h2 className="text-[22px] font-semibold text-slate-900">
                    Sélectionnez une conversation
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Choisissez un échange pour afficher les messages et écrire au vendeur.
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}