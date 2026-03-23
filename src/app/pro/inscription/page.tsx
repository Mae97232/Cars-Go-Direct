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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/pro/callback`,
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
          setErrorMessage("Ce compte existe déjà, mais le mot de passe est incorrect.");
          setLoading(false);
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", loginData.user.id)
          .single();

        if (profileError) {
          setErrorMessage("Impossible de reprendre votre inscription.");
          setLoading(false);
          return;
        }

        if (profile?.role !== "pro") {
          const { error: upgradeError } = await supabase
            .from("profiles")
            .update({ role: "pro" })
            .eq("id", loginData.user.id);

          if (upgradeError) {
            setErrorMessage("Impossible de convertir ce compte en compte professionnel.");
            setLoading(false);
            return;
          }
        }

        if (!profile?.onboarding_completed) {
          router.push("/pro/onboarding");
          return;
        }

        router.push("/pro/dashboard");
        return;
      }

      setErrorMessage(error.message || "Impossible de créer le compte.");
      setLoading(false);
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
        setErrorMessage("Compte créé, mais impossible d’initialiser le profil professionnel.");
        setLoading(false);
        return;
      }
    }

    setSuccessMessage("Compte créé. Redirection...");
    router.push("/pro/onboarding");
  }

  async function signupGoogle() {
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
      setErrorMessage(error.message || "Impossible de continuer avec Google.");
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
          <AuthProviders mode="signup" onGoogle={signupGoogle} loading={loading} />
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

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
            className="text-3d-button mt-2 inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:opacity-60"
          >
            {loading ? "Création..." : "Créer mon accès pro"}
          </button>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link href="/pro/connexion" className="font-medium text-black hover:underline">
              Déjà un compte ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}