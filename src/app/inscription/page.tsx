"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserRound, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import AuthProviders from "@/components/AuthProviders";

export default function InscriptionParticulierPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const firstName = String(formData.get("first_name") || "").trim();
    const lastName = String(formData.get("last_name") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "").trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          phone,
          account_type: "private",
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        account_type: "private",
      });
    }

    window.location.href = "/compte";
  }

  async function signupGoogle() {
    setLoading(true);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  return (
    <main className="min-h-screen bg-[#f8f6f3]">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-xl">
          <div className="animate-fade-up mb-8 text-center">
            <div className="text-3d-button mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#171311] text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]">
              <UserRound className="h-6 w-6" />
            </div>

            <h1 className="text-3d-hero text-3xl font-bold tracking-tight text-black">
              Créer un compte particulier
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Inscrivez-vous pour gérer vos favoris, vos messages et vos annonces.
            </p>
          </div>

          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="mb-6">
              <AuthProviders
                mode="signup"
                onGoogle={signupGoogle}
                loading={loading}
              />
            </div>

            <form onSubmit={handleSignup} className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  Prénom
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="first_name"
                    type="text"
                    required
                    placeholder="Votre prénom"
                    className="text-3d-soft h-12 w-full rounded-2xl border border-[#e4ddd4] bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              <div>
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  Nom
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="last_name"
                    type="text"
                    required
                    placeholder="Votre nom"
                    className="text-3d-soft h-12 w-full rounded-2xl border border-[#e4ddd4] bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="phone"
                    type="tel"
                    placeholder="Votre numéro"
                    className="text-3d-soft h-12 w-full rounded-2xl border border-[#e4ddd4] bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="vous@email.com"
                    className="text-3d-soft h-12 w-full rounded-2xl border border-[#e4ddd4] bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-700">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="Choisissez un mot de passe"
                    className="text-3d-soft h-12 w-full rounded-2xl border border-[#e4ddd4] bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              {errorMessage ? (
                <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              ) : null}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="text-3d-button inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#171311] px-5 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Création du compte..." : "Créer mon compte"}
                </button>
              </div>
            </form>

            <div className="text-3d-soft mt-6 text-center text-sm text-slate-600">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="font-medium text-black hover:underline">
                Se connecter
              </Link>
            </div>

            <div className="text-3d-soft mt-3 text-center text-sm text-slate-600">
              Vous êtes professionnel ?{" "}
              <Link href="/pro/inscription" className="font-medium text-black hover:underline">
                Créer un compte pro
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}