import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SecurityClient from "./SecurityClient";

function formatLastLogin(value?: string | null) {
  if (!value) return "Non disponible";

  try {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return "Non disponible";
  }
}

function formatProvider(user: {
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
}) {
  const providers = user.app_metadata?.providers;
  const singleProvider = user.app_metadata?.provider;

  const raw =
    Array.isArray(providers) && providers.length > 0
      ? providers[0]
      : singleProvider || "email";

  if (raw === "google") return "Google";
  if (raw === "email") return "Email et mot de passe";
  if (raw === "apple") return "Apple";
  if (raw === "facebook") return "Facebook";
  if (raw === "github") return "GitHub";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export default async function SecuritePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/pro/connexion");
  }

  const lastLogin =
    user.last_sign_in_at ||
    user.updated_at ||
    user.created_at ||
    null;

  const provider = formatProvider(user);

  return (
    <SecurityClient
      email={user.email ?? ""}
      provider={provider}
      lastLoginFormatted={formatLastLogin(lastLogin)}
    />
  );
}