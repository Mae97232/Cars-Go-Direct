import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ConversationRow = {
  id: string;
  listing_id: string | null;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string | null;
  buyer_profile_id: string | null;
  garage_id: string | null;
  created_at: string;
  updated_at: string;
  pro_unread_count: number | null;
  buyer_unread_count: number | null;
};

type ListingRow = {
  id: string;
  title: string | null;
};

type MessageRow = {
  id: string;
  conversation_id: string | null;
  sender_type: "buyer" | "pro";
  sender_name: string;
  content: string;
  created_at: string;
};

type ProfileRow = {
  id: string;
  avatar_url: string | null;
};

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select("id, garage_name")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (proError) {
      console.error("Erreur récupération compte pro :", proError);
      return NextResponse.json(
        {
          error: `Impossible de récupérer le compte professionnel : ${proError.message}`,
        },
        { status: 500 }
      );
    }

    if (!proAccount) {
      return NextResponse.json(
        { error: "Compte professionnel introuvable." },
        { status: 404 }
      );
    }

    const { data: conversationsData, error: conversationsError } = await supabase
      .from("conversations")
      .select(
        "id, listing_id, buyer_name, buyer_email, buyer_phone, buyer_profile_id, garage_id, created_at, updated_at, pro_unread_count, buyer_unread_count"
      )
      .eq("garage_id", proAccount.id)
      .order("updated_at", { ascending: false });

    if (conversationsError) {
      console.error("Erreur chargement conversations :", conversationsError);
      return NextResponse.json(
        {
          error: `Impossible de charger les conversations : ${conversationsError.message}`,
        },
        { status: 500 }
      );
    }

    const conversations = (conversationsData ?? []) as ConversationRow[];

    if (conversations.length === 0) {
      return NextResponse.json({
        success: true,
        proAccountId: String(proAccount.id),
        conversations: [],
      });
    }

    const listingIds = Array.from(
      new Set(
        conversations
          .map((c) => c.listing_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const conversationIds = conversations.map((c) => c.id);

    const buyerProfileIds = Array.from(
      new Set(
        conversations
          .map((c) => c.buyer_profile_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    const [listingsResult, messagesResult, profilesResult] = await Promise.all([
      listingIds.length > 0
        ? supabase.from("listings").select("id, title").in("id", listingIds)
        : Promise.resolve({ data: [], error: null }),
      conversationIds.length > 0
        ? supabase
            .from("messages")
            .select(
              "id, conversation_id, sender_type, sender_name, content, created_at"
            )
            .in("conversation_id", conversationIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      buyerProfileIds.length > 0
        ? supabase
            .from("profiles")
            .select("id, avatar_url")
            .in("id", buyerProfileIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    const listingsData = listingsResult.data;
    const listingsError = listingsResult.error;
    const messagesData = messagesResult.data;
    const messagesError = messagesResult.error;
    const profilesData = profilesResult.data;
    const profilesError = profilesResult.error;

    if (listingsError) {
      console.error("Erreur chargement annonces liées :", listingsError);
      return NextResponse.json(
        {
          error: `Impossible de charger les annonces liées : ${listingsError.message}`,
        },
        { status: 500 }
      );
    }

    if (messagesError) {
      console.error("Erreur chargement messages :", messagesError);
      return NextResponse.json(
        {
          error: `Impossible de charger les messages : ${messagesError.message}`,
        },
        { status: 500 }
      );
    }

    if (profilesError) {
      console.error("Erreur chargement avatars acheteurs :", profilesError);
    }

    const listings = (listingsData ?? []) as ListingRow[];
    const messages = (messagesData ?? []) as MessageRow[];
    const profiles = (profilesData ?? []) as ProfileRow[];

    const listingMap = new Map<string, ListingRow>(
      listings.map((listing) => [String(listing.id), listing])
    );

    const profileMap = new Map<string, ProfileRow>(
      profiles.map((profile) => [String(profile.id), profile])
    );

    const messagesByConversation = new Map<string, MessageRow[]>();

    for (const message of messages) {
      if (!message.conversation_id) continue;

      const conversationId = String(message.conversation_id);
      const current = messagesByConversation.get(conversationId) ?? [];

      current.push({
        id: String(message.id),
        conversation_id: conversationId,
        sender_type: message.sender_type,
        sender_name: message.sender_name ?? "Utilisateur",
        content: message.content ?? "",
        created_at: message.created_at,
      });

      messagesByConversation.set(conversationId, current);
    }

    const enriched = conversations.map((conversation) => ({
      id: String(conversation.id),
      listing_id: conversation.listing_id ? String(conversation.listing_id) : null,
      buyer_name: conversation.buyer_name ?? "Acheteur",
      buyer_email: conversation.buyer_email ?? "",
      buyer_phone: conversation.buyer_phone ?? null,
      buyer_profile_id: conversation.buyer_profile_id
        ? String(conversation.buyer_profile_id)
        : null,
      buyer_avatar_url: conversation.buyer_profile_id
        ? profileMap.get(String(conversation.buyer_profile_id))?.avatar_url ?? null
        : null,
      garage_id: conversation.garage_id ? String(conversation.garage_id) : null,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at,
      pro_unread_count: conversation.pro_unread_count ?? 0,
      buyer_unread_count: conversation.buyer_unread_count ?? 0,
      listing_title: conversation.listing_id
        ? listingMap.get(String(conversation.listing_id))?.title ?? "Annonce"
        : "Annonce",
      messages: messagesByConversation.get(String(conversation.id)) ?? [],
    }));

    return NextResponse.json({
      success: true,
      proAccountId: String(proAccount.id),
      conversations: enriched,
    });
  } catch (error) {
    console.error("Erreur API /api/messages/pro :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}