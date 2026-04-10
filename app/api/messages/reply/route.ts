import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendBuyerToSellerEmail } from "@/lib/message-emails";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user || !user.email) {
      return NextResponse.json(
        { error: "Connexion requise." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const conversationId = clean(body.conversationId);
    const content = clean(body.content);

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: "Données manquantes." },
        { status: 400 }
      );
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select(
        "id, buyer_name, buyer_email, seller_email, listing_id, pro_unread_count, buyer_unread_count"
      )
      .eq("id", conversationId)
      .eq("buyer_email", user.email)
      .maybeSingle();

    if (conversationError) {
      console.error("Erreur lecture conversation :", conversationError);
      return NextResponse.json(
        { error: "Impossible de charger la conversation." },
        { status: 500 }
      );
    }

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404 }
      );
    }

    const senderName =
      conversation.buyer_name ||
      clean(user.user_metadata?.full_name) ||
      clean(user.user_metadata?.name) ||
      user.email.split("@")[0] ||
      "Acheteur";

    const { data: insertedMessage, error: insertError } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversation.id,
        sender_type: "buyer",
        sender_name: senderName,
        content,
      })
      .select("id, sender_type, sender_name, content, created_at")
      .single();

    if (insertError || !insertedMessage) {
      console.error("Erreur insertion message :", insertError);
      return NextResponse.json(
        { error: "Impossible d’envoyer le message." },
        { status: 500 }
      );
    }

    const nextProUnreadCount = (conversation.pro_unread_count ?? 0) + 1;

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        pro_unread_count: nextProUnreadCount,
        buyer_unread_count: 0,
        last_message_at: insertedMessage.created_at,
        updated_at: insertedMessage.created_at,
      })
      .eq("id", conversation.id);

    if (updateError) {
      console.error("Erreur update conversation :", updateError);
      return NextResponse.json(
        { error: "Impossible de mettre à jour la conversation." },
        { status: 500 }
      );
    }

    let listingTitle = "Annonce";

    if (conversation.listing_id) {
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("title")
        .eq("id", conversation.listing_id)
        .maybeSingle();

      if (listingError) {
        console.error("Erreur récupération annonce :", listingError);
      }

      listingTitle = clean(listing?.title) || "Annonce";
    }

    let emailResult = null;
    let emailErrorMessage: string | null = null;

    if (conversation.seller_email) {
      try {
        emailResult = await sendBuyerToSellerEmail({
          to: conversation.seller_email,
          garageName: "Garage",
          buyerName: senderName,
          buyerEmail: user.email,
          listingTitle,
          message: content,
          conversationId: conversation.id,
        });

        console.log("EMAIL GARAGE ENVOYE =", emailResult);
      } catch (emailError) {
        console.error("Erreur envoi email garage :", emailError);
        emailErrorMessage =
          emailError instanceof Error ? emailError.message : "Erreur email inconnue";
      }
    } else {
      emailErrorMessage = "seller_email manquant";
      console.error("Aucun seller_email dans la conversation.");
    }

    return NextResponse.json({
      success: true,
      emailSent: !emailErrorMessage,
      emailError: emailErrorMessage,
      emailResult,
      message: {
        id: insertedMessage.id,
        senderType: insertedMessage.sender_type,
        senderName: insertedMessage.sender_name,
        content: insertedMessage.content,
        createdAt: insertedMessage.created_at,
      },
    });
  } catch (error) {
    console.error("Erreur API messages/reply :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}