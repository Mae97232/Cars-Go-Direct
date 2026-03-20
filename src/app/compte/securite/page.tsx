import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import PasswordSecurityForm from "./PasswordSecurityForm";

function SecurityLine({
  title,
  description,
  value,
  action,
}: {
  title: string;
  description: string;
  value?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="animate-fade-up flex flex-col gap-4 border-b border-[#ece7e0] py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-3d-title text-[15px] font-semibold text-black">
          {title}
        </h3>
        <p className="text-3d-soft mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
        {value ? (
          <p className="text-3d-soft mt-3 text-sm font-medium text-slate-900">
            {value}
          </p>
        ) : null}
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

function formatLastSignIn(value?: string | null) {
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

export default async function CompteSecuritePage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const email = user.email ?? "";
  const provider = formatProvider(user);
  const lastSignIn = formatLastSignIn(
    user.last_sign_in_at || user.updated_at || user.created_at || null
  );

  return (
    <div className="mx-auto max-w-5xl">
      {/* breadcrumb */}
      <div className="animate-fade-up flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link
          href="/compte"
          className="text-3d-soft font-medium text-[#171311] hover:underline"
        >
          Mon compte
        </Link>
        <span>›</span>
        <span className="text-3d-soft">Connexion et sécurité</span>
      </div>

      {/* header */}
      <section className="animate-fade-up mt-5 border-b border-[#ece7e0] pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-3d-soft text-sm text-slate-500">
              Compte particulier
            </p>
            <h1 className="text-3d-hero mt-1 text-3xl font-bold tracking-tight text-black">
              Connexion et sécurité
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Gérez l’accès à votre compte, votre adresse email et la sécurité de connexion.
            </p>
          </div>

          <Link
            href="/compte"
            className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
          >
            Retour au compte
          </Link>
        </div>
      </section>

      {/* EMAIL */}
      <section className="animate-fade-up py-8">
        <div className="border-b border-[#ece7e0] pb-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-black" />
            <h2 className="text-3d-title text-xl font-semibold text-black">
              Adresse email
            </h2>
          </div>
          <p className="text-3d-soft mt-2 text-sm text-slate-600">
            Votre email principal de connexion à la plateforme.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <SecurityLine
            title="Email de connexion"
            description="Cette adresse est utilisée pour vous connecter à votre compte."
            value={email}
            action={
              <button className="text-3d-button rounded-2xl bg-[#171311] px-4 py-3 text-sm text-white hover:bg-[#0f0d0c]">
                Modifier
              </button>
            }
          />
        </div>
      </section>

      <PasswordSecurityForm email={email} />

      {/* SECURITE */}
      <section className="animate-fade-up py-2">
        <div className="border-b border-[#ece7e0] pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-black" />
            <h2 className="text-3d-title text-xl font-semibold text-black">
              Sécurité du compte
            </h2>
          </div>
          <p className="text-3d-soft mt-2 text-sm text-slate-600">
            Informations utiles sur vos accès et votre méthode de connexion.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <SecurityLine
            title="Méthode de connexion"
            description="Méthode utilisée pour accéder à votre compte."
            value={provider}
          />

          <SecurityLine
            title="Dernière connexion"
            description="Dernière activité enregistrée sur votre compte."
            value={lastSignIn}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-[#e8d9c5] bg-[#fdf6ed] px-4 py-4">
          <p className="text-3d-title text-sm font-semibold text-black">
            Conseil de sécurité
          </p>
          <p className="text-3d-soft mt-2 text-sm leading-6 text-slate-700">
            Ne partagez jamais votre mot de passe. Vérifiez régulièrement vos connexions et
            conservez une adresse email sécurisée pour votre compte.
          </p>
        </div>
      </section>

      {/* LOGOUT */}
      <section className="animate-fade-up border-t border-[#ece7e0] py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3d-title text-xl font-semibold text-black">
              Déconnexion
            </h2>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Vous pouvez fermer votre session à tout moment depuis votre espace personnel.
            </p>
          </div>

          <Link
            href="/deconnexion"
            className="text-3d-button inline-flex items-center gap-2 rounded-2xl bg-[#171311] px-5 py-3 text-sm text-white hover:bg-[#0f0d0c]"
          >
            <LogOut className="h-4 w-4" />
            Me déconnecter
          </Link>
        </div>
      </section>
    </div>
  );
}