import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ conversationId: string }>;

export async function GET(
  req: Request,
  { params }: { params: RouteParams }
) {
  const { conversationId } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Impossible de charger les messages." },
      { status: 500 }
    );
  }

  return NextResponse.json({ messages: data });
}