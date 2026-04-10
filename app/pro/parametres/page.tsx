import Link from "next/link";
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
    <div className="mx-auto max-w-6xl bg-white text-slate-900">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link
          href="/pro/dashboard"
          className="font-medium text-slate-700 hover:underline"
        >
          Dashboard
        </Link>
        <span>›</span>
        <span>Paramètres</span>
      </div>

      <section className="mt-5 border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
              Paramètres du compte professionnel
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Gérez les informations de votre garage, votre profil et vos préférences privées.
            </p>
          </div>

          <Link
            href="/pro/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            Retour au dashboard
          </Link>
        </div>
      </section>

      <div className="mt-6">
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
      </div>
    </div>
  );
}