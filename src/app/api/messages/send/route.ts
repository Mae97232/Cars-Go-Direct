import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendSellerToBuyerEmail } from "@/lib/message-emails";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    console.log("API /api/messages/send APPELEE");

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log("USER =", user?.id);
    console.log("USER ERROR =", userError);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Non autorisé." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const conversationId = clean(body.conversationId);
    const senderType = clean(body.senderType);
    const message = clean(body.message);

    console.log("conversationId =", conversationId);
    console.log("senderType =", senderType);
    console.log("message =", message);

    if (!conversationId || !message || senderType !== "pro") {
      return NextResponse.json(
        { error: "Données invalides." },
        { status: 400 }
      );
    }

    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select("id, garage_name")
      .eq("profile_id", user.id)
      .single();

    console.log("PRO ACCOUNT =", proAccount);
    console.log("PRO ERROR =", proError);

    if (proError || !proAccount) {
      return NextResponse.json(
        { error: "Compte professionnel introuvable." },
        { status: 404 }
      );
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, garage_id, buyer_email, listing_id, buyer_unread_count, pro_unread_count")
      .eq("id", conversationId)
      .single();

    console.log("CONVERSATION =", conversation);
    console.log("CONVERSATION ERROR =", conversationError);

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404 }
      );
    }

    if (String(conversation.garage_id) !== String(proAccount.id)) {
      console.log("ACCES REFUSE");
      return NextResponse.json(
        { error: "Accès refusé." },
        { status: 403 }
      );
    }

    const { data: insertedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        sender_type: "pro",
        sender_name: proAccount.garage_name || "Garage",
        content: message,
      })
      .select("id, conversation_id, sender_type, sender_name, content, created_at")
      .single();

    console.log("INSERTED MESSAGE =", insertedMessage);
    console.log("MESSAGE ERROR =", messageError);

    if (messageError || !insertedMessage) {
      return NextResponse.json(
        { error: "Impossible d’envoyer le message." },
        { status: 500 }
      );
    }

    const nextBuyerUnreadCount = (conversation.buyer_unread_count ?? 0) + 1;

    const { error: updateConversationError } = await supabase
      .from("conversations")
      .update({
        buyer_unread_count: nextBuyerUnreadCount,
        pro_unread_count: 0,
        last_message_at: insertedMessage.created_at,
        updated_at: insertedMessage.created_at,
      })
      .eq("id", conversationId);

    if (updateConversationError) {
      console.error("Erreur mise à jour conversation :", updateConversationError);
    }

    let listingTitle = "Annonce";

    if (conversation.listing_id) {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("title")
        .eq("id", conversation.listing_id)
        .maybeSingle();

      console.log("LISTING =", listing);
      console.log("LISTING ERROR =", listingError);

      listingTitle = clean(listing?.title) || "Annonce";
    }

    console.log("buyer_email =", conversation.buyer_email);
    console.log("listingTitle =", listingTitle);
    console.log("JUSTE AVANT sendSellerToBuyerEmail");

    let emailResult = null;
    let emailErrorMessage: string | null = null;

    if (conversation.buyer_email) {
      try {
        emailResult = await sendSellerToBuyerEmail({
          to: conversation.buyer_email,
          garageName: proAccount.garage_name || "Garage",
          listingTitle,
          message,
          conversationId,
        });

        console.log("EMAIL ACHETEUR ENVOYE =", emailResult);
      } catch (emailError) {
        console.error("Erreur envoi email acheteur :", emailError);
        emailErrorMessage =
          emailError instanceof Error ? emailError.message : "Erreur email inconnue";
      }
    } else {
      console.log("AUCUN buyer_email, email non envoyé");
      emailErrorMessage = "buyer_email manquant";
    }

    return NextResponse.json({
      success: true,
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
    console.error("Erreur API messages/send :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}