import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  const supabase = await createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${origin}/pro/connexion`);
  }

  // 🔥 FORCER ROLE PRO ICI
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email,
      role: "pro",
      onboarding_completed: false,
    });
  } else if (profile.role !== "pro") {
    await supabase
      .from("profiles")
      .update({ role: "pro" })
      .eq("id", user.id);
  }

  // 🔥 REDIRECTION
  const { data: updatedProfile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  if (!updatedProfile?.onboarding_completed) {
    return NextResponse.redirect(`${origin}/pro/onboarding`);
  }

  return NextResponse.redirect(`${origin}/pro/dashboard`);
}