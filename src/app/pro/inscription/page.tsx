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
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/pro/onboarding`,
        data: {
          signup_role: "pro",
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Compte créé. Redirection en cours...");

    router.push("/pro/onboarding");
    router.refresh();
  }

  async function signupGoogle() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/pro/onboarding`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-xl font-bold tracking-tight text-black sm:text-2xl">
          Créer un compte professionnel
        </h1>

        <p className="text-3d-soft mt-2 text-sm text-slate-600">
          Créez votre accès pro, puis finalisez votre compte avec la vérification SIRET.
        </p>

        <div className="mt-6">
          <AuthProviders
            mode="signup"
            onGoogle={signupGoogle}
            loading={loading}
          />
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        ) : null}

        <form onSubmit={signup} className="mt-5 grid gap-3">
          <input
            name="email"
            required
            type="email"
            placeholder="Email professionnel"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
          />

          <input
            name="password"
            required
            type="password"
            placeholder="Mot de passe"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-black focus:ring-4 focus:ring-black/5"
          />

          <button
            disabled={loading}
            className="text-3d-button mt-2 inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon accès pro"}
          </button>

          <p className="text-3d-soft mt-2 text-xs text-slate-500">
            Après création du compte, vous serez redirigé vers l’étape de vérification SIRET.
          </p>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link
              href="/pro/connexion"
              className="text-3d-soft font-medium text-black hover:underline"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link
              href="/inscription"
              className="text-3d-soft font-medium text-black hover:underline"
            >
              Vous êtes particulier ? Créer un compte particulier
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}