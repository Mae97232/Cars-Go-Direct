import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type GuardProfile = {
  id: string;
  email: string | null;
  role: string;
  is_admin: boolean;
  is_suspended: boolean;
  deleted_at: string | null;
};

export async function requireAuth(redirectTo = "/connexion") {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect(redirectTo);
  }

  return { supabase, user };
}

export async function requireProfile(redirectTo = "/connexion") {
  const { supabase, user } = await requireAuth(redirectTo);

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, role, is_admin, is_suspended, deleted_at")
    .eq("id", user.id)
    .maybeSingle<GuardProfile>();

  if (error || !profile) {
    redirect(redirectTo);
  }

  if (profile.deleted_at) {
    await supabase.auth.signOut();
    redirect(redirectTo);
  }

  if (profile.is_suspended) {
    await supabase.auth.signOut();
    redirect(redirectTo);
  }

  return { supabase, user, profile };
}

export async function requireAdmin() {
  const { supabase, user, profile } = await requireProfile("/connexion");

  const isAdmin = profile.is_admin === true || profile.role === "admin";

  if (!isAdmin) {
    redirect("/");
  }

  return { supabase, user, profile };
}

export async function requirePro() {
  const { supabase, user, profile } = await requireProfile("/pro/connexion");

  const isPro = profile.role === "pro";

  if (!isPro) {
    redirect("/pro/connexion");
  }

  return { supabase, user, profile };
}

export async function requireBuyer() {
  const { supabase, user, profile } = await requireProfile("/connexion");

  const isAdmin = profile.is_admin === true || profile.role === "admin";
  const isPro = profile.role === "pro";

  if (isAdmin || isPro) {
    redirect("/");
  }

  return { supabase, user, profile };
}