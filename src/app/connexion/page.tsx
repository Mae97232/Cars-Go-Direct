"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthProviders from "@/components/AuthProviders";

export default function ConnexionParticulierPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setErrorMessage("Impossible de récupérer le compte utilisateur.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type")
      .eq("id", userId)
      .maybeSingle();

    if (profile?.account_type === "pro") {
      window.location.href = "/pro/dashboard";
      return;
    }

    window.location.href = "/compte";
  }

  async function loginGoogle() {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-md bg-orange-500 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
              <UserRound className="h-7 w-7" />
            </div>

            <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
              Connexion particulier
            </h1>

            <p className="mt-3 text-sm text-slate-600">
              Connectez-vous à votre espace personnel.
            </p>
          </div>

          <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="mb-6">
              <AuthProviders
                mode="signin"
                onGoogle={loginGoogle}
                loading={loading}
              />
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Adresse email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="vous@email.com"
                    className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Votre mot de passe"
                    className="h-12 w-full rounded-md border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link
                href="/inscription"
                className="font-semibold text-orange-600 hover:underline"
              >
                Créer un compte particulier
              </Link>
            </div>

            <div className="mt-3 text-center text-sm text-slate-600">
              Vous êtes un professionnel ?{" "}
              <Link
                href="/pro/connexion"
                className="font-semibold text-orange-600 hover:underline"
              >
                Accéder à l’espace pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}