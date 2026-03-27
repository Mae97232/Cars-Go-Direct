"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    if (password.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setSuccessMessage("Votre mot de passe a été réinitialisé avec succès.");

    setTimeout(() => {
      router.push("/pro/dashboard/securite");
    }, 1200);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">

          {/* Icône */}
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-orange-600 text-lg">
            🔒
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Réinitialiser le mot de passe
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Entrez votre nouveau mot de passe pour sécuriser votre compte.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-700">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {errorMessage && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
            >
              {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}