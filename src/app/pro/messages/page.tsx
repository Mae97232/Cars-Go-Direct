"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Search, Send, Phone, Mail, Circle } from "lucide-react";

type MessageItem = {
  id: string;
  conversation_id: string;
  sender_type: "buyer" | "pro";
  sender_name: string;
  content: string;
  created_at: string;
};

type ConversationItem = {
  id: string;
  listing_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_avatar_url?: string | null;
  garage_id: string | null;
  created_at: string;
  updated_at: string;
  listing_title: string;
  pro_unread_count?: number;
  buyer_unread_count?: number;
  messages: MessageItem[];
};

function formatMessageTime(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

function formatSidebarTime(value: string) {
  try {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
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
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === "lg" ? "h-11 w-11 text-sm" : "h-10 w-10 text-xs";

  if (!src || imgError) {
    return (
      <div
        className={`grid ${sizeClass} shrink-0 place-items-center rounded-full bg-slate-950 font-semibold text-white`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} shrink-0 rounded-full object-cover ring-1 ring-slate-200`}
      onError={() => setImgError(true)}
    />
  );
}

export default function ProMessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [text, setText] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function refresh(preferredActiveId?: string) {
    setLoadingMessages(true);

    try {
      const res = await fetch("/api/messages/pro", {
        method: "GET",
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Impossible de charger les conversations.");
        setLoadingMessages(false);
        return;
      }

      const nextConversations: ConversationItem[] = Array.isArray(data.conversations)
        ? data.conversations
        : [];

      setConversations(nextConversations);

      if (nextConversations.length > 0) {
        setActiveId((prev) => {
          const targetId = preferredActiveId ?? prev;
          const exists = nextConversations.some((c) => c.id === targetId);
          return exists ? targetId : nextConversations[0].id;
        });
      } else {
        setActiveId("");
      }
    } finally {
      setLoadingMessages(false);
    }
  }

  async function markConversationAsRead(conversationId: string) {
    try {
      await fetch("/api/messages/pro/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ conversationId }),
      });

      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === conversationId
            ? { ...conversation, pro_unread_count: 0 }
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
    await markConversationAsRead(conversationId);
  }

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/pro/connexion");
        return;
      }

      setCheckingAuth(false);
      await refresh();
    }

    checkAuth();
  }, [router, supabase]);

  useEffect(() => {
    if (!activeId) return;

    const current = conversations.find((conversation) => conversation.id === activeId);
    if (current && (current.pro_unread_count ?? 0) > 0) {
      markConversationAsRead(activeId);
    }
  }, [activeId, conversations]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return conversations;

    return conversations.filter((conversation) => {
      const lastMessage =
        conversation.messages.length > 0
          ? conversation.messages[conversation.messages.length - 1]
          : null;

      return (
        conversation.listing_title.toLowerCase().includes(term) ||
        conversation.buyer_name.toLowerCase().includes(term) ||
        conversation.buyer_email.toLowerCase().includes(term) ||
        (lastMessage?.content || "").toLowerCase().includes(term)
      );
    });
  }, [conversations, search]);

  const activeConversation = useMemo(
    () =>
      filteredConversations.find((c) => c.id === activeId) ??
      conversations.find((c) => c.id === activeId) ??
      null,
    [filteredConversations, conversations, activeId]
  );

  const totalUnreadCount = useMemo(() => {
    return conversations.reduce(
      (sum, conversation) => sum + (conversation.pro_unread_count ?? 0),
      0
    );
  }, [conversations]);

  async function sendMessage() {
    if (!activeConversation || !text.trim()) return;

    setSending(true);

    try {
      const res = await fetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversationId: activeConversation.id,
          senderType: "pro",
          message: text.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Impossible d’envoyer le message.");
        setSending(false);
        return;
      }

      setText("");
      await refresh(activeConversation.id);
      router.refresh();
    } catch {
      alert("Erreur réseau.");
    } finally {
      setSending(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="py-10 text-sm text-slate-500">
        Vérification de la session...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-140px)] bg-white">
      <div className="border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Messagerie professionnelle</p>
            <div className="mt-1 flex items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Messages clients
              </h1>

              {totalUnreadCount > 0 ? (
                <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white">
                  {totalUnreadCount}
                </span>
              ) : null}
            </div>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Retrouvez vos demandes acheteurs, répondez rapidement et suivez vos échanges.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 border-b border-slate-300 px-1 py-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher un acheteur, une annonce, un message..."
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-h-[700px] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-r border-slate-200">
          <div className="divide-y divide-slate-100">
            {loadingMessages ? (
              <div className="px-5 py-6 text-sm text-slate-500">
                Chargement des conversations...
              </div>
            ) : filteredConversations.length ? (
              filteredConversations.map((conversation) => {
                const lastMessage =
                  conversation.messages.length > 0
                    ? conversation.messages[conversation.messages.length - 1]
                    : null;

                const active = activeId === conversation.id;
                const initials = getInitials(conversation.buyer_name) || "C";
                const unreadCount = conversation.pro_unread_count ?? 0;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => openConversation(conversation.id)}
                    className={
                      active
                        ? "flex w-full items-start gap-4 border-l-2 border-slate-950 bg-slate-50 px-5 py-5 text-left"
                        : "flex w-full items-start gap-4 border-l-2 border-transparent px-5 py-5 text-left transition hover:bg-slate-50"
                    }
                  >
                    <Avatar
                      src={conversation.buyer_avatar_url}
                      alt={conversation.buyer_name}
                      initials={initials}
                      size="lg"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {conversation.buyer_name}
                            </p>

                            {unreadCount > 0 ? (
                              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                                {unreadCount}
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {conversation.listing_title || "Annonce"}
                          </p>
                        </div>

                        <span className="shrink-0 text-xs text-slate-400">
                          {lastMessage ? formatSidebarTime(lastMessage.created_at) : ""}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-slate-600">
                        {lastMessage
                          ? `${lastMessage.sender_name} : ${lastMessage.content}`
                          : "Aucun message"}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-5 py-8 text-sm text-slate-500">
                Aucun message reçu pour le moment.
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0">
          {activeConversation ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Circle className="h-2.5 w-2.5 fill-current text-emerald-500" />
                      <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Conversation active
                      </span>
                    </div>

                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      {activeConversation.listing_title || "Annonce"}
                    </h2>

                    <p className="mt-2 text-sm text-slate-600">
                      Acheteur : {activeConversation.buyer_name}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span>{activeConversation.buyer_email}</span>
                    </div>

                    {activeConversation.buyer_phone ? (
                      <div className="inline-flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span>{activeConversation.buyer_phone}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-6">
                {activeConversation.messages.length ? (
                  activeConversation.messages.map((message) => {
                    const mine = message.sender_type === "pro";
                    const buyerInitials = getInitials(activeConversation.buyer_name) || "C";

                    return (
                      <div
                        key={message.id}
                        className={mine ? "flex justify-end" : "flex justify-start"}
                      >
                        <div
                          className={`flex max-w-[78%] items-end gap-3 ${
                            mine ? "flex-row-reverse ml-auto" : "flex-row"
                          }`}
                        >
                          {mine ? (
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">
                              P
                            </div>
                          ) : (
                            <Avatar
                              src={activeConversation.buyer_avatar_url}
                              alt={activeConversation.buyer_name}
                              initials={buyerInitials}
                            />
                          )}

                          <div>
                            <div
                              className={`mb-1 flex items-center gap-2 text-xs text-slate-400 ${
                                mine ? "justify-end" : "justify-start"
                              }`}
                            >
                              <span className="font-medium text-slate-500">
                                {message.sender_name}
                              </span>
                              <span>{formatMessageTime(message.created_at)}</span>
                            </div>

                            <div
                              className={
                                mine
                                  ? "rounded-2xl rounded-tr-md bg-slate-950 px-4 py-3 text-sm leading-6 text-white"
                                  : "rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3 text-sm leading-6 text-slate-900"
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

              <div className="border-t border-slate-200 px-6 py-5">
                <div className="flex flex-col gap-3">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full resize-none border-b border-slate-300 bg-transparent px-1 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    placeholder="Écrire une réponse à l’acheteur..."
                  />

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={sendMessage}
                      disabled={sending}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
                <h2 className="text-xl font-semibold text-slate-900">
                  Sélectionnez une conversation
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Choisissez un échange dans la colonne de gauche pour afficher les messages
                  et répondre à l’acheteur.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}