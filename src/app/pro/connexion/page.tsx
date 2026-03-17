"use client";

import { useState } from "react";
import Link from "next/link";
import AuthProviders from "@/components/AuthProviders";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ConnexionPro() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    window.location.href = "/pro/dashboard";
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

  async function resetPassword() {
    const email = prompt("Entrez votre email");

    if (!email) return;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Email de réinitialisation envoyé.");
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-6">
        <h1 className="text-xl font-bold tracking-tight">
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

        <form onSubmit={login} className="grid gap-3 mt-5">
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <input
            name="password"
            required
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <button disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="flex items-center justify-between text-sm mt-2">
            <button
              type="button"
              className="text-slate-600 hover:underline"
              onClick={resetPassword}
            >
              Mot de passe oublié
            </button>

            <Link
              href="/pro/inscription"
              className="font-semibold hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}