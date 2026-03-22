import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;

  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/connexion`);
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/connexion`);
  }

  if (next === "/pro/onboarding") {
    return NextResponse.redirect(
      `${origin}/auth/post-login?next=${encodeURIComponent("/pro/onboarding")}`
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.redirect(`${origin}/connexion`);
  }

  if (profile?.role === "pro") {
    const { data: proAccount } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (!proAccount) {
      return NextResponse.redirect(
        `${origin}/auth/post-login?next=${encodeURIComponent("/pro/onboarding")}`
      );
    }

    return NextResponse.redirect(
      `${origin}/auth/post-login?next=${encodeURIComponent("/pro/dashboard")}`
    );
  }

  return NextResponse.redirect(
    `${origin}/auth/post-login?next=${encodeURIComponent("/compte")}`
  );
}