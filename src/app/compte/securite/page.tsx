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
    <div className="flex flex-col gap-4 border-b border-slate-200 py-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h3 className="text-[15px] font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
        {value ? (
          <p className="mt-3 text-sm font-medium text-slate-900">
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
    <div className="mx-auto max-w-5xl bg-white text-slate-900">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link
          href="/compte"
          className="font-medium text-slate-700 hover:text-orange-600 hover:underline"
        >
          Mon compte
        </Link>
        <span>›</span>
        <span>Connexion et sécurité</span>
      </div>

      <section className="mt-5 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Compte particulier
            </p>
            <h1 className="mt-1 text-[26px] font-semibold text-slate-900 sm:text-[30px]">
              Connexion et sécurité
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Gérez l’accès à votre compte, votre adresse email et la sécurité de connexion.
            </p>
          </div>

          <Link
            href="/compte"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            Retour au compte
          </Link>
        </div>
      </section>

      <section className="py-8">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-slate-900" />
            <h2 className="text-[22px] font-semibold text-slate-900">
              Adresse email
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Votre email principal de connexion à la plateforme.
          </p>
        </div>

        <div>
          <SecurityLine
            title="Email de connexion"
            description="Cette adresse est utilisée pour vous connecter à votre compte."
            value={email}
            action={
              <button className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white transition hover:bg-orange-600">
                Modifier
              </button>
            }
          />
        </div>
      </section>

      <PasswordSecurityForm email={email} />

      <section className="py-2">
        <div className="border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-900" />
            <h2 className="text-[22px] font-semibold text-slate-900">
              Sécurité du compte
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Informations utiles sur vos accès et votre méthode de connexion.
          </p>
        </div>

        <div>
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

        <div className="mt-6 border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <p className="text-sm font-semibold text-slate-900">
            Conseil de sécurité
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Ne partagez jamais votre mot de passe. Vérifiez régulièrement vos connexions et
            conservez une adresse email sécurisée pour votre compte.
          </p>
        </div>
      </section>

      <section className="border-t border-slate-200 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[22px] font-semibold text-slate-900">
              Déconnexion
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Vous pouvez fermer votre session à tout moment depuis votre espace personnel.
            </p>
          </div>

          <Link
            href="/deconnexion"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <LogOut className="h-4 w-4" />
            Me déconnecter
          </Link>
        </div>
      </section>
    </div>
  );
}