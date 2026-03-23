import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
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

  let { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.redirect(`${origin}/connexion`);
  }

  if (!profile) {
    const { data: newProfile, error: createProfileError } = await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: user.email,
        role: "buyer",
        onboarding_completed: false,
      })
      .select("role, onboarding_completed")
      .single();

    if (createProfileError || !newProfile) {
      return NextResponse.redirect(`${origin}/connexion`);
    }

    profile = newProfile;
  }

  if (profile.role === "pro") {
    if (!profile.onboarding_completed) {
      return NextResponse.redirect(`${origin}/pro/onboarding`);
    }

    return NextResponse.redirect(`${origin}/pro/dashboard`);
  }

  return NextResponse.redirect(`${origin}/compte`);
}