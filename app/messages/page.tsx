import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessagesClient, { type UiConversation } from "./MessagesClient";

type RawConversation = {
  id: string;
  listing_id: string | null;
  garage_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  created_at: string | null;
  updated_at: string | null;
  buyer_unread_count: number | null;
  pro_unread_count: number | null;
  listings:
    | {
        title: string | null;
      }
    | {
        title: string | null;
      }[]
    | null;
  pro_accounts:
    | {
        garage_name: string | null;
        profile_id: string | null;
      }
    | {
        garage_name: string | null;
        profile_id: string | null;
      }[]
    | null;
  messages:
    | {
        id: string;
        sender_type: string;
        sender_name: string;
        content: string;
        created_at: string | null;
      }[]
    | null;
};

type ProfileRow = {
  id: string;
  avatar_url: string | null;
};

function getSingleRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default async function MessagesPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const email = user.email ?? "";

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      listing_id,
      garage_id,
      buyer_name,
      buyer_email,
      buyer_phone,
      created_at,
      updated_at,
      buyer_unread_count,
      pro_unread_count,
      listings (
        title
      ),
      pro_accounts (
        garage_name,
        profile_id
      ),
      messages (
        id,
        sender_type,
        sender_name,
        content,
        created_at
      )
    `)
    .eq("buyer_email", email)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Erreur chargement conversations :", error);
  }

  const rawConversations = (data ?? []) as RawConversation[];

  const profileIds = Array.from(
    new Set(
      rawConversations
        .map((conversation) => getSingleRelation(conversation.pro_accounts)?.profile_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  let profileAvatarMap = new Map<string, string | null>();

  if (profileIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, avatar_url")
      .in("id", profileIds);

    if (profilesError) {
      console.error("Erreur chargement avatars profils :", profilesError);
    } else {
      profileAvatarMap = new Map(
        ((profilesData ?? []) as ProfileRow[]).map((profile) => [
          profile.id,
          profile.avatar_url ?? null,
        ])
      );
    }
  }

  const conversations: UiConversation[] = rawConversations.map((conversation) => {
    const listing = getSingleRelation(conversation.listings);
    const garage = getSingleRelation(conversation.pro_accounts);
    const garageProfileId = garage?.profile_id ?? null;

    const messages = (conversation.messages ?? [])
      .map((message) => ({
        id: message.id,
        senderType: message.sender_type,
        senderName: message.sender_name,
        content: message.content,
        createdAt: message.created_at,
      }))
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime;
      });

    return {
      id: conversation.id,
      listingId: conversation.listing_id,
      garageId: conversation.garage_id,
      listingTitle: listing?.title || "Annonce",
      garageName: garage?.garage_name || "Garage",
      garageAvatarUrl: garageProfileId
        ? profileAvatarMap.get(garageProfileId) ?? null
        : null,
      buyerName: conversation.buyer_name,
      buyerEmail: conversation.buyer_email,
      buyerPhone: conversation.buyer_phone,
      createdAt: conversation.created_at,
      updatedAt: conversation.updated_at,
      buyerUnreadCount: conversation.buyer_unread_count ?? 0,
      proUnreadCount: conversation.pro_unread_count ?? 0,
      messages,
    };
  });

  return <MessagesClient initialConversations={conversations} />;
}