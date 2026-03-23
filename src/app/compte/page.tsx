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
      className="animate-fade-up flex items-center justify-between gap-4 border-b border-[#f1ece6] py-5 transition hover:bg-[#faf7f2]/70"
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#f5f3ef] text-[#171311]">
          {icon}
        </div>

        <div className="min-w-0">
          <h3 className="text-3d-title text-[15px] font-semibold text-black">
            {title}
          </h3>
          <p className="text-3d-soft mt-1 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-slate-400">
        <ChevronRight className="h-5 w-5" />
      </div>
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
    clean(user.user_metadata?.first_name) ||
    user.email?.split("@")[0] ||
    "Utilisateur";

  const email = user.email ?? "Non renseigné";
  const phone = clean(profile?.phone) ?? "Non renseigné";
  const city = clean(profile?.city) ?? "Non renseignée";
  const avatarUrl = clean(profile?.avatar_url);
  const initial = getInitial(displayName, email);

  return (
    <div className="mx-auto max-w-6xl">
      <section className="animate-fade-up border-b border-[#ece7e0] pb-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative">
              {avatarUrl ? (
                <img
                  key={avatarUrl}
                  src={avatarUrl}
                  alt={displayName}
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-[#e4ddd4] sm:h-24 sm:w-24"
                />
              ) : (
                <div className="text-3d-button grid h-20 w-20 place-items-center rounded-full bg-[#171311] text-3xl font-bold text-white sm:h-24 sm:w-24">
                  {initial}
                </div>
              )}

              <div className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full border border-[#e4ddd4] bg-white text-[#171311] shadow-sm">
                <Camera className="h-4 w-4" />
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-3d-soft text-sm text-slate-500">Compte particulier</p>

              <h1 className="text-3d-hero mt-1 text-3xl font-bold tracking-tight text-black sm:text-4xl">
                {displayName}
              </h1>

              <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                <p className="text-3d-soft">{email}</p>
                <p className="text-3d-soft">{phone}</p>
                <p className="text-3d-soft">{city}</p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-3d-soft inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Compte actif
                </span>
                <span className="text-3d-soft inline-flex items-center rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-semibold text-[#171311]">
                  Espace personnel
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/compte/parametres"
              className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
            >
              Modifier mon profil
            </Link>

            <Link
              href="/deconnexion"
              className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c]"
            >
              Me déconnecter
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="h-fit">
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <nav className="grid">
              <Link
                href="/compte"
                className="text-3d-button rounded-2xl bg-[#171311] px-4 py-3 text-sm font-semibold text-white"
              >
                Vue d’ensemble
              </Link>

              <Link
                href="/compte/parametres"
                className="text-3d-soft rounded-2xl px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Paramètres
              </Link>

              <Link
                href="/compte/securite"
                className="text-3d-soft rounded-2xl px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Sécurité
              </Link>

              <Link
                href="/compte/favoris"
                className="text-3d-soft rounded-2xl px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Favoris
              </Link>

              <Link
                href="/messages"
                className="text-3d-soft rounded-2xl px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Messages
              </Link>

              <Link
                href="/compte/facture"
                className="text-3d-soft rounded-2xl px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Facture
              </Link>
            </nav>
          </div>
        </aside>

        <div className="min-w-0 space-y-10">
          <section className="animate-fade-up" style={{ animationDelay: "0.06s" }}>
            <div className="border-b border-[#ece7e0] pb-4">
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Informations du compte
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Retrouvez vos informations principales directement depuis votre espace.
              </p>
            </div>

            <div className="grid gap-x-10 gap-y-5 py-6 sm:grid-cols-2">
              <div>
                <p className="text-3d-soft text-sm text-slate-500">Nom</p>
                <p className="text-3d-title mt-1 text-[15px] font-medium text-black">
                  {displayName}
                </p>
              </div>

              <div>
                <p className="text-3d-soft text-sm text-slate-500">Adresse email</p>
                <p className="text-3d-title mt-1 text-[15px] font-medium text-black">
                  {email}
                </p>
              </div>

              <div>
                <p className="text-3d-soft text-sm text-slate-500">Téléphone</p>
                <p className="text-3d-title mt-1 text-[15px] font-medium text-black">
                  {phone}
                </p>
              </div>

              <div>
                <p className="text-3d-soft text-sm text-slate-500">Ville</p>
                <p className="text-3d-title mt-1 text-[15px] font-medium text-black">
                  {city}
                </p>
              </div>
            </div>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <div className="border-b border-[#ece7e0] pb-4">
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Gérer mon compte
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Accédez rapidement aux sections utiles de votre espace personnel.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <LineLink
                href="/compte/parametres"
                icon={<Settings className="h-5 w-5" />}
                title="Mes paramètres"
                description="Modifiez vos informations personnelles et mettez à jour votre profil."
              />

              <LineLink
                href="/compte/securite"
                icon={<Shield className="h-5 w-5" />}
                title="Connexion et sécurité"
                description="Gérez votre email, votre mot de passe et la sécurité de votre compte."
              />

              <LineLink
                href="/compte/favoris"
                icon={<Heart className="h-5 w-5" />}
                title="Mes favoris"
                description="Retrouvez les annonces enregistrées pour les consulter plus tard."
              />

              <LineLink
                href="/messages"
                icon={<MessageSquare className="h-5 w-5" />}
                title="Mes messages"
                description="Suivez vos échanges avec les vendeurs et répondez rapidement."
              />

              <LineLink
                href="/compte/facture"
                icon={<FileText className="h-5 w-5" />}
                title="Facture"
                description="Consultez vos documents et l’historique de vos paiements."
              />
            </div>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.14s" }}>
            <div className="border-b border-[#ece7e0] pb-4">
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Actions rapides
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Les raccourcis essentiels de votre espace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 py-6">
              <Link
                href="/annonces"
                className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Voir les annonces
              </Link>

              <Link
                href="/compte/favoris"
                className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Voir mes favoris
              </Link>

              <Link
                href="/messages"
                className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              >
                Ouvrir mes messages
              </Link>
            </div>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.18s" }}>
            <div className="border-b border-[#ece7e0] pb-4">
              <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
                Aide et assistance
              </h2>
              <p className="text-3d-soft mt-1 text-sm text-slate-600">
                Besoin d’aide sur votre compte ou sur la plateforme.
              </p>
            </div>

            <div className="divide-y divide-slate-100">
              <LineLink
                href="/compte/parametres"
                icon={<UserCircle2 className="h-5 w-5" />}
                title="Mon profil"
                description="Mettre à jour mon identité, ma photo et mes informations."
              />

              <LineLink
                href="/aide"
                icon={<HelpCircle className="h-5 w-5" />}
                title="Centre d’aide"
                description="Accédez aux réponses fréquentes et aux informations utiles."
              />

              <LineLink
                href="/deconnexion"
                icon={<LogOut className="h-5 w-5" />}
                title="Déconnexion"
                description="Fermer la session et quitter votre espace personnel."
              />
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}