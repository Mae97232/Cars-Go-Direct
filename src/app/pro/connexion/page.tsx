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
    <div className="mx-auto max-w-md">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h1 className="text-3d-hero text-xl font-bold tracking-tight text-black">
          Connexion professionnel
        </h1>

        <p className="text-3d-soft mt-2 text-sm text-slate-600">
          Accédez à votre espace pro pour gérer vos annonces.
        </p>

        <div className="mt-6">
          <AuthProviders
            mode="signin"
            onGoogle={loginGoogle}
            loading={loading}
          />
        </div>

        <form onSubmit={login} className="mt-5 grid gap-3">
          <input
            name="email"
            required
            type="email"
            placeholder="Email"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <input
            name="password"
            required
            type="password"
            placeholder="Mot de passe"
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <button
            disabled={loading}
            className="text-3d-button mt-2 inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <div className="mt-2 flex items-center justify-between text-sm">
            <button
              type="button"
              className="text-3d-soft text-slate-600 hover:underline"
              onClick={resetPassword}
            >
              Mot de passe oublié
            </button>

            <Link
              href="/pro/inscription"
              className="text-3d-soft font-semibold text-black hover:underline"
            >
              Créer un compte
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}