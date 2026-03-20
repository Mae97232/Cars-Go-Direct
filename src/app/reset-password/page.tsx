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
    <div className="mx-auto max-w-xl px-4 py-16">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h1 className="text-3d-hero text-2xl font-semibold tracking-tight text-black">
          Réinitialiser le mot de passe
        </h1>

        <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
          Entrez votre nouveau mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-800">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
            />
          </div>

          <div>
            <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-800">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
            />
          </div>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="text-3d-button inline-flex rounded-2xl bg-[#171311] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f0d0c] disabled:opacity-60"
          >
            {loading ? "Enregistrement..." : "Enregistrer le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}