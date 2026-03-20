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
    <main className="min-h-screen bg-[#f8fbff]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">

          {/* HEADER */}
          <div className="animate-fade-up mb-10 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#1b2f79] text-white shadow-lg">
              <UserRound className="h-7 w-7" />
            </div>

            <h1 className="text-3d-hero text-3xl font-bold tracking-tight text-[#162d84]">
              Connexion particulier
            </h1>

            <p className="text-3d-soft mt-3 text-sm text-slate-600">
              Connectez-vous à votre espace personnel.
            </p>
          </div>

          {/* CARD */}
          <div className="animate-fade-up rounded-[28px] border border-[#d8e3ff] bg-white p-6 shadow-[0_14px_40px_rgba(35,71,183,0.06)] sm:p-8">

            {/* SOCIAL */}
            <div className="mb-6">
              <AuthProviders
                mode="signin"
                onGoogle={loginGoogle}
                loading={loading}
              />
            </div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* EMAIL */}
              <div>
                <label className="text-3d-soft mb-2 block text-sm font-medium">
                  Adresse email
                </label>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="vous@email.com"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#1b2f79] focus:ring-2 focus:ring-[#1b2f79]/10"
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-3d-soft mb-2 block text-sm font-medium">
                  Mot de passe
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Votre mot de passe"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#1b2f79] focus:ring-2 focus:ring-[#1b2f79]/10"
                  />
                </div>
              </div>

              {/* ERROR */}
              {errorMessage ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="text-3d-button inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#1b2f79] px-5 text-sm font-semibold text-white transition hover:bg-[#14245f] disabled:opacity-60"
              >
                {loading ? "Connexion..." : "Se connecter"}
              </button>
            </form>

            {/* LINKS */}
            <div className="mt-6 text-center text-sm text-slate-600">
              Pas encore de compte ?{" "}
              <Link href="/inscription" className="font-semibold text-[#162d84] hover:underline">
                Créer un compte particulier
              </Link>
            </div>

            <div className="mt-3 text-center text-sm text-slate-600">
              Vous êtes un professionnel ?{" "}
              <Link href="/pro/connexion" className="font-semibold text-[#162d84] hover:underline">
                Accéder à l’espace pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}