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
      phone,
      email,
      website,
      address,
      zip_code,
    } = body;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non connecté." },
        { status: 401 }
      );
    }

    const { data: existing, error: existingError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      );
    }

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        data: existing,
      });
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
          verification_status: verification_status || "approved",
          phone: phone || null,
          email: email || user.email || null,
          website: website || null,
          address: address || null,
          zip_code: zip_code || null,
          google_match_status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    try {
      if (data?.id) {
        const origin =
          req.headers.get("origin") ||
          process.env.NEXT_PUBLIC_SITE_URL ||
          "http://localhost:3000";

        await fetch(`${origin}/api/google-match-garage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: req.headers.get("cookie") || "",
          },
          body: JSON.stringify({
            proAccountId: data.id,
          }),
          cache: "no-store",
        });
      }
    } catch (matchError) {
      console.error("GOOGLE_MATCH_AFTER_CREATE_ERROR", matchError);
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("CREATE_PRO_ACCOUNT_ERROR", error);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}