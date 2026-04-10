"use client";

import { useState } from "react";
import Link from "next/link";
import AuthProviders from "@/components/AuthProviders";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function InscriptionPro() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const supabase = createClient();
  const router = useRouter();

  async function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData(e.currentTarget);

      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/pro/callback?next=pro-signup`,
          data: {
            signup_role: "pro",
          },
        },
      });

      if (error) {
        const message = error.message?.toLowerCase() || "";

        if (message.includes("already registered")) {
          const { data: loginData, error: loginError } =
            await supabase.auth.signInWithPassword({
              email,
              password,
            });

          if (loginError || !loginData.user) {
            setErrorMessage(
              "Ce compte existe déjà, mais le mot de passe est incorrect."
            );
            return;
          }

          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, onboarding_completed")
            .eq("id", loginData.user.id)
            .maybeSingle();

          if (profileError) {
            setErrorMessage("Impossible de reprendre votre inscription.");
            return;
          }

          if (!profile) {
            const { error: createProfileError } = await supabase
              .from("profiles")
              .upsert({
                id: loginData.user.id,
                email,
                role: "pro",
                onboarding_completed: false,
              });

            if (createProfileError) {
              setErrorMessage(
                "Impossible d’initialiser le profil professionnel."
              );
              return;
            }

            router.replace("/pro/onboarding");
            return;
          }

          if (profile.role !== "pro") {
            const { error: upgradeError } = await supabase
              .from("profiles")
              .update({ role: "pro" })
              .eq("id", loginData.user.id);

            if (upgradeError) {
              setErrorMessage(
                "Impossible de convertir ce compte en compte professionnel."
              );
              return;
            }
          }

          if (!profile.onboarding_completed) {
            router.replace("/pro/onboarding");
            return;
          }

          router.replace("/pro/dashboard");
          return;
        }

        setErrorMessage(error.message || "Impossible de créer le compte.");
        return;
      }

      const userId = data.user?.id;

      if (userId) {
        const { error: upsertError } = await supabase.from("profiles").upsert({
          id: userId,
          email,
          role: "pro",
          onboarding_completed: false,
        });

        if (upsertError) {
          setErrorMessage(
            "Compte créé, mais impossible d’initialiser le profil professionnel."
          );
          return;
        }
      }

      setSuccessMessage("Compte créé. Redirection vers la vérification...");
      router.replace("/pro/onboarding");
    } catch {
      setErrorMessage("Une erreur inattendue est survenue.");
    } finally {
      setLoading(false);
    }
  }

  async function signupGoogle() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/pro/callback?next=pro-signup`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "Impossible de continuer avec Google.");
        setLoading(false);
      }
    } catch {
      setErrorMessage("Impossible de continuer avec Google.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-600">
            Espace professionnel
          </span>
          <span>Inscription sécurisée</span>
          <span>•</span>
          <span>Vérification SIRET obligatoire</span>
        </div>

        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
          Créer un compte professionnel
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Créez votre accès pro en quelques secondes. Juste après, vous devrez
          compléter votre profil et renseigner votre <strong>SIRET</strong> pour
          vérifier votre activité.
        </p>

        <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
          Après cette étape, vous serez redirigé vers la vérification de votre
          entreprise : nom du garage, SIRET, coordonnées et informations
          professionnelles.
        </div>

        <div className="mt-6">
          <AuthProviders mode="signup" onGoogle={signupGoogle} loading={loading} />
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={signup} className="mt-5 grid gap-3">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Email professionnel
            </label>
            <input
              id="email"
              name="email"
              required
              type="email"
              autoComplete="email"
              placeholder="garage@email.com"
              className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-[12px] font-medium text-slate-700"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              required
              type="password"
              autoComplete="new-password"
              placeholder="Votre mot de passe"
              className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon accès pro"}
          </button>

          <p className="mt-1 text-center text-xs text-slate-500">
            Étape suivante : vérification du garage et du SIRET.
          </p>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link
              href="/pro/connexion"
              className="font-medium text-orange-600 hover:underline"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}