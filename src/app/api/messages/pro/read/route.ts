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

    const { data: proAccount, error: proError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (proError || !proAccount) {
      return NextResponse.json(
        { error: "Compte professionnel introuvable." },
        { status: 404 }
      );
    }

    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("id, garage_id")
      .eq("id", conversationId)
      .maybeSingle();

    if (conversationError || !conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable." },
        { status: 404 }
      );
    }

    if (String(conversation.garage_id) !== String(proAccount.id)) {
      return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from("conversations")
      .update({
        pro_unread_count: 0,
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
    console.error("Erreur API messages/pro/read :", error);
    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}