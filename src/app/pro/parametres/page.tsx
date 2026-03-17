import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";
import ProAccountSettingsForm from "@/components/ProAccountSettingsForm";

export default async function ProParametresPage() {
  noStore();
  await requireAuth();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, city, address, birthdate, gender, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Impossible de charger le profil : ${profileError.message}`);
  }

  const { data: privateSettings, error: privateSettingsError } = await supabase
    .from("private_user_settings")
    .select("iban, notifications_messages, notifications_emails")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (privateSettingsError) {
    throw new Error(
      `Impossible de charger les paramètres privés : ${privateSettingsError.message}`
    );
  }

  const { data: proAccount, error: proAccountError } = await supabase
    .from("pro_accounts")
    .select(
      "garage_name, city, phone, email, website, address, zip_code, opening_hours, description"
    )
    .eq("profile_id", user.id)
    .maybeSingle();

  if (proAccountError) {
    throw new Error(
      `Impossible de charger le compte professionnel : ${proAccountError.message}`
    );
  }

  const safeBirthdate =
    profile?.birthdate && !Number.isNaN(new Date(profile.birthdate).getTime())
      ? new Date(profile.birthdate).toISOString().slice(0, 10)
      : "";

  return (
    <ProAccountSettingsForm
      userId={user.id}
      userEmail={user.email || ""}
      garageName={proAccount?.garage_name || ""}
      initialProfile={{
        firstName: profile?.first_name || "",
        lastName: profile?.last_name || "",
        phone: profile?.phone || "",
        city: profile?.city || proAccount?.city || "",
        address: profile?.address || "",
        birthdate: safeBirthdate,
        gender: profile?.gender || "unspecified",
        avatarUrl: profile?.avatar_url || null,
      }}
      initialPrivateSettings={{
        iban: privateSettings?.iban || "",
        notificationsMessages: privateSettings?.notifications_messages ?? true,
        notificationsEmails: privateSettings?.notifications_emails ?? true,
      }}
      initialGarageSettings={{
        garagePhone: proAccount?.phone || "",
        garageEmail: proAccount?.email || "",
        website: proAccount?.website || "",
        garageAddress: proAccount?.address || "",
        zipCode: proAccount?.zip_code || "",
        openingHours: proAccount?.opening_hours || "",
        description: proAccount?.description || "",
      }}
    />
  );
}