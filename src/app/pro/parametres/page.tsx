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
    <div className="mx-auto grid max-w-6xl gap-6">
      <div className="animate-fade-up flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link
          href="/pro/dashboard"
          className="text-3d-soft font-medium text-slate-700 hover:underline"
        >
          Dashboard
        </Link>
        <span>›</span>
        <span className="text-3d-soft">Paramètres</span>
      </div>

      <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
              Paramètres du compte professionnel
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Gérez les informations de votre garage, votre profil et vos préférences privées.
            </p>
          </div>

          <Link
            href="/pro/dashboard"
            className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
          >
            Retour au dashboard
          </Link>
        </div>
      </section>

      <div className="animate-fade-up">
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