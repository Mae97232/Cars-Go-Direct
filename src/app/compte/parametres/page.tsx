import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AccountSettingsForm from "./AccountSettingsForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CompteParametresPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto grid max-w-5xl gap-6">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/compte" className="font-medium text-slate-700 hover:underline">
          Mon compte
        </Link>
        <span>›</span>
        <span>Paramètres</span>
      </div>

      <section className="card p-6 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Paramètres
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Gère les informations de ton compte utilisateur.
            </p>
          </div>

          <Link href="/compte" className="btn btn-secondary">
            Retour au compte
          </Link>
        </div>
      </section>

      <AccountSettingsForm
        userEmail={user.email ?? ""}
        userId={user.id}
        initialProfile={{
          firstName: profile?.first_name ?? "",
          lastName: profile?.last_name ?? "",
          phone: profile?.phone ?? "",
          city: profile?.city ?? "",
          address: profile?.address ?? "",
          birthdate: profile?.birthdate ?? "",
          gender: profile?.gender ?? "unspecified",
          avatarUrl: profile?.avatar_url ?? null,
        }}
        initialPrivateSettings={{
          iban: profile?.iban ?? "",
          notificationsMessages: profile?.notifications_messages ?? true,
          notificationsEmails: profile?.notifications_emails ?? true,
        }}
      />
    </div>
  );
}