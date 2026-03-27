import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const next = requestUrl.searchParams.get("next");

  const supabase = await createClient();

  if (!code) {
    return NextResponse.redirect(`${origin}/pro/connexion`);
  }

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(`${origin}/pro/connexion`);
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(`${origin}/pro/connexion`);
  }

  const isProSignupFlow =
    next === "pro-signup" || user.user_metadata?.signup_role === "pro";

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.redirect(`${origin}/pro/connexion`);
  }

  if (!profile && isProSignupFlow) {
    const { data: newProfile, error: createProfileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        role: "pro",
        onboarding_completed: false,
      })
      .select("role, onboarding_completed")
      .single();

    if (createProfileError || !newProfile) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/pro/connexion?error=profile_creation_failed`);
    }

    profile = newProfile;
  }

  if (!profile) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/pro/connexion?error=profile_not_found`);
  }

  if (isProSignupFlow && profile.role !== "pro") {
    const { error: upgradeError } = await supabase
      .from("profiles")
      .update({ role: "pro" })
      .eq("id", user.id);

    if (upgradeError) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/pro/connexion?error=not_pro_account`);
    }

    profile = {
      ...profile,
      role: "pro",
    };
  }

  if (profile.role !== "pro") {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/pro/connexion?error=not_pro_account`);
  }

  if (!profile.onboarding_completed) {
    return NextResponse.redirect(`${origin}/pro/onboarding`);
  }

  return NextResponse.redirect(`${origin}/pro/dashboard`);
}