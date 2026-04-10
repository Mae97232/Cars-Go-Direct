import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth-guard";

export async function POST(req: Request) {
  await requireAdmin();

  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: "Paramètres manquants." }, { status: 400 });
    }

    let status: "approved" | "rejected" | null = null;

    if (action === "approve") status = "approved";
    if (action === "reject") status = "rejected";

    if (!status) {
      return NextResponse.json({ error: "Action invalide." }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("pro_accounts")
      .update({
        verification_status: status,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}