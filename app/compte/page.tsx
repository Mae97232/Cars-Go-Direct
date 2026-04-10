export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Camera,
  ChevronRight,
  FileText,
  Heart,
  HelpCircle,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  UserCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function getInitial(name: string | null | undefined, email: string | null | undefined) {
  const source = (name || email || "U").trim();
  return source.charAt(0).toUpperCase();
}

function clean(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function LineLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 border-b border-slate-200 py-5 transition hover:bg-slate-50"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-slate-900">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <ChevronRight className="h-5 w-5 text-slate-400" />
    </Link>
  );
}

export default async function ComptePage() {
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
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (profile?.role === "pro") {
    redirect("/pro/dashboard");
  }

  const firstName = clean(profile?.first_name);
  const lastName = clean(profile?.last_name);

  const displayName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    clean(profile?.full_name) ||
    clean(user.user_metadata?.full_name) ||
    clean(user.user_metadata?.name) ||
    user.email?.split("@")[0] ||
    "Utilisateur";

  const email = user.email ?? "Non renseigné";
  const phone = clean(profile?.phone) ?? "Non renseigné";
  const city = clean(profile?.city) ?? "Non renseignée";
  const avatarUrl = clean(profile?.avatar_url);
  const initial = getInitial(displayName, email);

  return (
    <div className="mx-auto max-w-6xl bg-white text-slate-900">

      {/* HEADER */}
      <section className="border-b border-slate-200 pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div className="flex items-start gap-4">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-900 text-2xl font-bold text-white">
                  {initial}
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-slate-200 bg-white">
                <Camera className="h-4 w-4 text-slate-600" />
              </div>
            </div>

            <div>
              <p className="text-sm text-slate-500">Compte particulier</p>

              <h1 className="mt-1 text-[26px] font-semibold text-slate-900">
                {displayName}
              </h1>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>{email}</span>
                <span>{phone}</span>
                <span>{city}</span>
              </div>

              <div className="mt-3 flex gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  Compte actif
                </span>
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                  Espace personnel
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/compte/parametres"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600"
            >
              Modifier
            </Link>

            <Link
              href="/deconnexion"
              className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white hover:bg-orange-600"
            >
              Déconnexion
            </Link>
          </div>
        </div>
      </section>

      {/* LAYOUT */}
      <section className="grid gap-10 py-8 lg:grid-cols-[220px_minmax(0,1fr)]">

        {/* SIDEBAR */}
        <aside>
          <div className="border border-slate-200 bg-white p-2 shadow-sm">
            <nav className="grid gap-1">
              <Link href="/compte" className="rounded-md bg-orange-500 px-4 py-3 text-sm font-medium text-white">
                Vue d’ensemble
              </Link>

              {[
                ["Paramètres", "/compte/parametres"],
                ["Sécurité", "/compte/securite"],
                ["Favoris", "/compte/favoris"],
                ["Messages", "/messages"],
                ["Facture", "/compte/facture"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="rounded-md px-4 py-3 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* CONTENT */}
        <div className="space-y-10">

          {/* INFOS */}
          <section>
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-[22px] font-semibold">Informations</h2>
            </div>

            <div className="grid gap-6 py-6 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-slate-500">Nom</p>
                <p className="font-medium">{displayName}</p>
              </div>

              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium">{email}</p>
              </div>

              <div>
                <p className="text-slate-500">Téléphone</p>
                <p className="font-medium">{phone}</p>
              </div>

              <div>
                <p className="text-slate-500">Ville</p>
                <p className="font-medium">{city}</p>
              </div>
            </div>
          </section>

          {/* LINKS */}
          <section>
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-[22px] font-semibold">Mon compte</h2>
            </div>

            <div>
              <LineLink href="/compte/parametres" icon={<Settings className="h-5 w-5" />} title="Paramètres" description="Modifier vos informations" />
              <LineLink href="/compte/securite" icon={<Shield className="h-5 w-5" />} title="Sécurité" description="Mot de passe et accès" />
              <LineLink href="/compte/favoris" icon={<Heart className="h-5 w-5" />} title="Favoris" description="Vos annonces sauvegardées" />
              <LineLink href="/messages" icon={<MessageSquare className="h-5 w-5" />} title="Messages" description="Vos conversations" />
              <LineLink href="/compte/facture" icon={<FileText className="h-5 w-5" />} title="Factures" description="Historique paiements" />
            </div>
          </section>

          {/* AIDE */}
          <section>
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-[22px] font-semibold">Aide</h2>
            </div>

            <div>
              <LineLink href="/aide" icon={<HelpCircle className="h-5 w-5" />} title="Centre d’aide" description="Questions fréquentes" />
              <LineLink href="/deconnexion" icon={<LogOut className="h-5 w-5" />} title="Déconnexion" description="Quitter votre compte" />
            </div>
          </section>

        </div>
      </section>
    </div>
  );
}