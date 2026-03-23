import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      garage_name,
      siret,
      legal_name,
      city,
      ape_code,
      verification_status,
    } = body;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Utilisateur non connecté." }, { status: 401 });
    }

    const { data: existing, error: existingError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: true, alreadyExists: true, data: existing });
    }

    const { data, error } = await supabase
      .from("pro_accounts")
      .insert([
        {
          profile_id: user.id,
          garage_name,
          siret,
          legal_name,
          city,
          ape_code,
          verification_status,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}