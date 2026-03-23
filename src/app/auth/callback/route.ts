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

  // 🔥 RÉCUP PROFIL
  let { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  // 🔥 CRÉATION SI INEXISTANT
  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        role: next?.startsWith("/pro") ? "pro" : "buyer", // ✅ FIX
        onboarding_completed: false,
      })
      .select()
      .single();

    profile = newProfile;
  }

  // 🔥 UPGRADE buyer → pro SI LOGIN VIA /pro
  if (profile && profile.role !== "pro" && next?.startsWith("/pro")) {
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .update({ role: "pro" })
      .eq("id", user.id)
      .select()
      .single();

    profile = updatedProfile;
  }

  // 🔥 REDIRECTION PRO
  if (profile?.role === "pro") {
    if (!profile.onboarding_completed) {
      return NextResponse.redirect(
        `${origin}/auth/post-login?next=${encodeURIComponent("/pro/onboarding")}`
      );
    }

    return NextResponse.redirect(
      `${origin}/auth/post-login?next=${encodeURIComponent("/pro/dashboard")}`
      );
  }

  // 🔥 PARTICULIER
  return NextResponse.redirect(
    `${origin}/auth/post-login?next=${encodeURIComponent("/compte")}`
  );
}