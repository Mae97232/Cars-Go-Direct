import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBuyerToSellerEmail } from "@/lib/message-emails";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    console.log("API /api/messages/start APPELEE");

    const supabase = await createClient();
    const body = await req.json();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("Erreur auth utilisateur :", userError);
    }

    const listingId = clean(body.listingId);
    const listingTitleFromBody = clean(body.listingTitle);
    const name = clean(body.name);
    const email = clean(body.email);
    const phone = clean(body.phone);
    const message = clean(body.message);

    console.log("listingId =", listingId);
    console.log("name =", name);
    console.log("email =", email);
    console.log("message =", message);

    if (!listingId || !name || !email || !message) {
      return NextResponse.json(
        { error: "Données manquantes." },
        { status: 400 }
      );
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, title, pro_account_id")
      .eq("id", listingId)
      .maybeSingle();

    if (listingError || !listing) {
      console.error("Erreur récupération annonce :", listingError);
      return NextResponse.json(
        { error: "Annonce introuvable." },
        { status: 404 }
      );
    }

    if (!listing.pro_account_id) {
      return NextResponse.json(
        { error: "Aucun vendeur lié à cette annonce." },
        { status: 400 }
      );
    }

    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select("id, garage_name, email")
      .eq("id", listing.pro_account_id)
      .maybeSingle();

    if (proError || !proAccount) {
      console.error("Erreur récupération garage :", proError);
      return NextResponse.json(
        { error: "Garage introuvable." },
        { status: 404 }
      );
    }

    const sellerEmail = clean(proAccount.email);

    console.log("garageName =", proAccount.garage_name);
    console.log("sellerEmail =", sellerEmail);

    if (!sellerEmail) {
      return NextResponse.json(
        { error: "Email vendeur introuvable." },
        { status: 400 }
      );
    }

    const { data: existingConversation, error: existingConversationError } =
      await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("garage_id", proAccount.id)
        .eq("buyer_email", email)
        .maybeSingle();

    if (existingConversationError) {
      console.error("Erreur recherche conversation :", existingConversationError);
      return NextResponse.json(
        {
          error:
            existingConversationError.message ||
            "Impossible de vérifier la conversation existante.",
        },
        { status: 500 }
      );
    }

    let conversationId = existingConversation?.id ?? null;

    if (!conversationId) {
      const now = new Date().toISOString();

      const { data: conversation, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          listing_id: listing.id,
          garage_id: proAccount.id,
          buyer_name: name,
          buyer_email: email,
          buyer_phone: phone || null,
          buyer_profile_id: user?.id ?? null,
          seller_email: sellerEmail,
          buyer_unread_count: 0,
          pro_unread_count: 0,
          last_message_at: now,
          updated_at: now,
        })
        .select("id")
        .single();

      if (conversationError || !conversation) {
        console.error("Erreur création conversation :", conversationError);
        return NextResponse.json(
          {
            error:
              conversationError?.message ||
              "Impossible de créer la conversation.",
          },
          { status: 500 }
        );
      }

      conversationId = conversation.id;
      console.log("Nouvelle conversation créée =", conversationId);
    } else {
      const { error: updateExistingConversationError } = await supabase
        .from("conversations")
        .update({
          buyer_name: name,
          buyer_email: email,
          buyer_phone: phone || null,
          buyer_profile_id: user?.id ?? null,
          seller_email: sellerEmail,
          updated_at: new Date().toISOString(),
        })
        .eq("id", conversationId);

      if (updateExistingConversationError) {
        console.error(
          "Erreur mise à jour conversation existante :",
          updateExistingConversationError
        );
      }

      console.log("Conversation existante =", conversationId);
    }

    const { data: insertedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type: "buyer",
        sender_name: name,
        content: message,
      })
      .select("id, conversation_id, sender_type, sender_name, content, created_at")
      .single();

    if (messageError || !insertedMessage) {
      console.error("Erreur insertion message :", messageError);
      return NextResponse.json(
        {
          error: messageError?.message || "Impossible d’envoyer le message.",
        },
        { status: 500 }
      );
    }

    const { data: currentConversation, error: currentConversationError } =
      await supabase
        .from("conversations")
        .select("pro_unread_count")
        .eq("id", conversationId)
        .maybeSingle();

    if (currentConversationError) {
      console.error(
        "Erreur récupération unread vendeur :",
        currentConversationError
      );
    }

    const nextProUnreadCount = (currentConversation?.pro_unread_count ?? 0) + 1;

    const { error: updateConversationError } = await supabase
      .from("conversations")
      .update({
        pro_unread_count: nextProUnreadCount,
        buyer_unread_count: 0,
        last_message_at: insertedMessage.created_at,
        updated_at: insertedMessage.created_at,
      })
      .eq("id", conversationId);

    if (updateConversationError) {
      console.error(
        "Erreur mise à jour conversation après message :",
        updateConversationError
      );
    }

    console.log("JUSTE AVANT sendBuyerToSellerEmail");

    let emailResult = null;
    let emailErrorMessage: string | null = null;

    try {
      emailResult = await sendBuyerToSellerEmail({
        to: sellerEmail,
        garageName: proAccount.garage_name || "Garage",
        buyerName: name,
        buyerEmail: email,
        listingTitle: listing.title || listingTitleFromBody || "Annonce",
        message,
        conversationId,
      });

      console.log("EMAIL VENDEUR ENVOYE =", emailResult);
    } catch (emailError) {
      console.error("Erreur envoi email vendeur :", emailError);
      emailErrorMessage =
        emailError instanceof Error ? emailError.message : "Erreur email inconnue";
    }

    return NextResponse.json({
      success: true,
      conversationId,
      listingTitle: listing.title || listingTitleFromBody || "Annonce",
      garageName: proAccount.garage_name || "Garage",
      emailSent: !emailErrorMessage,
      emailError: emailErrorMessage,
      emailResult,
      message: {
        id: insertedMessage.id,
        conversationId: insertedMessage.conversation_id,
        senderType: insertedMessage.sender_type,
        senderName: insertedMessage.sender_name,
        content: insertedMessage.content,
        createdAt: insertedMessage.created_at,
      },
    });
  } catch (error) {
    console.error("Erreur API messages/start :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}