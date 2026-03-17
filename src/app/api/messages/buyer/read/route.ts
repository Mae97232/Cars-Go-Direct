import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

    if (userError || !user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const body = await req.json();
    const conversationId = clean(body.conversationId);

    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation invalide." },
        { status: 400 }
      );
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, buyer_email")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404 }
      );
    }

    if ((conversation.buyer_email ?? "").toLowerCase() !== (user.email ?? "").toLowerCase()) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        buyer_unread_count: 0,
      })
      .eq("id", conversationId);

    if (updateError) {
      return NextResponse.json(
        { error: "Impossible de marquer la conversation comme lue." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API messages/buyer/read :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}