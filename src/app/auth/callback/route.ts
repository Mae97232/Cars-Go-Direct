import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const origin = requestUrl.origin;

  const supabase = await createClient();

  // 1. Échange le code OAuth contre une session
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 2. Récupère l'utilisateur
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/connexion`);
  }

  // 3. Cas onboarding pro
  if (next === "/pro/onboarding") {
    return NextResponse.redirect(
      `${origin}/auth/post-login?next=${encodeURIComponent("/pro/onboarding")}`
    );
  }

  // 4. Vérifie le rôle
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 5. Redirection avec passage par post-login
  if (profile?.role === "pro") {
    return NextResponse.redirect(
      `${origin}/auth/post-login?next=${encodeURIComponent("/pro/dashboard")}`
    );
  }

  // 6. Particulier
  return NextResponse.redirect(
    `${origin}/auth/post-login?next=${encodeURIComponent("/compte")}`
  );
}