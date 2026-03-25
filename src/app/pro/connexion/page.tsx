"use client";

import { useState } from "react";
import Link from "next/link";
import AuthProviders from "@/components/AuthProviders";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ConnexionPro() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const formData = new FormData(e.currentTarget);

    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    const { data: signInData, error: signInError } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (signInError || !signInData.user) {
      setErrorMessage(
        "Email ou mot de passe incorrect. Si le compte a été créé avec Google, utilisez Google pour vous connecter."
      );
      setLoading(false);
      return;
    }

    const user = signInData.user;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      setErrorMessage("Impossible de vérifier votre compte pour le moment.");
      setLoading(false);
      return;
    }

    if (!profile) {
      await supabase.auth.signOut();
      setErrorMessage("Aucun profil professionnel n’a été trouvé pour ce compte.");
      setLoading(false);
      return;
    }

    if (profile.role !== "pro") {
      await supabase.auth.signOut();
      setErrorMessage("Ce compte n’est pas un compte professionnel.");
      setLoading(false);
      return;
    }

    setSuccessMessage("Connexion réussie. Redirection en cours...");

    if (!profile.onboarding_completed) {
      router.push("/pro/onboarding");
      router.refresh();
      return;
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  async function loginGoogle() {
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/pro/callback`,
      },
    });

    if (error) {
      setErrorMessage("Impossible de se connecter avec Google.");
      setLoading(false);
    }
  }

  async function resetPassword() {
    setErrorMessage("");
    setSuccessMessage("");

    const email = window.prompt("Entrez votre email");

    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      setErrorMessage("Impossible d’envoyer l’email de réinitialisation.");
      return;
    }

    setSuccessMessage("Email de réinitialisation envoyé.");
  }

  return (
    <div className="mx-auto max-w-md bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h1 className="text-[26px] font-semibold text-slate-900">
          Connexion professionnel
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Accédez à votre espace pro pour gérer vos annonces.
        </p>

        <div className="mt-6">
          <AuthProviders
            mode="signin"
            onGoogle={loginGoogle}
            loading={loading}
          />
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

        <form onSubmit={login} className="mt-5 grid gap-3">
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <input
            name="password"
            required
            type="password"
            placeholder="Mot de passe"
            className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="mt-2 flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-slate-600 hover:text-orange-600 hover:underline"
              onClick={resetPassword}
            >
              Mot de passe oublié
            </button>

            <Link
              href="/pro/inscription"
              className="font-semibold text-orange-600 hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}