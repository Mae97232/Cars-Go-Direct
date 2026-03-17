"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
};

export default function PasswordSecurityForm({ email }: Props) {
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setLoadingUpdate(true);

    try {
      if (!currentPassword || !newPassword || !confirmPassword) {
        setErrorMessage("Veuillez remplir tous les champs.");
        setLoadingUpdate(false);
        return;
      }

      if (newPassword.length < 6) {
        setErrorMessage("Le nouveau mot de passe doit contenir au moins 6 caractères.");
        setLoadingUpdate(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setErrorMessage("La confirmation du mot de passe ne correspond pas.");
        setLoadingUpdate(false);
        return;
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user?.email) {
        setErrorMessage("Utilisateur introuvable. Veuillez vous reconnecter.");
        setLoadingUpdate(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        setErrorMessage("Le mot de passe actuel est incorrect.");
        setLoadingUpdate(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setErrorMessage(updateError.message);
        setLoadingUpdate(false);
        return;
      }

      setSuccessMessage("Votre mot de passe a bien été mis à jour.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoadingUpdate(false);
    }
  }

  async function handleSendResetEmail() {
    setErrorMessage("");
    setSuccessMessage("");
    setLoadingReset(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingReset(false);
        return;
      }

      setSuccessMessage("Un email de réinitialisation a été envoyé.");
    } catch {
      setErrorMessage("Impossible d’envoyer l’email de réinitialisation.");
    } finally {
      setLoadingReset(false);
    }
  }

  const isDisabled = loadingUpdate || loadingReset;

  return (
    <section className="py-2">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-slate-700" />
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">
            Mot de passe
          </h2>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Mettez à jour votre mot de passe pour renforcer la sécurité du compte.
        </p>
      </div>

      <form onSubmit={handleChangePassword} className="py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Entrez votre mot de passe actuel"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
            />
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={isDisabled}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingUpdate ? "Mise à jour..." : "Mettre à jour le mot de passe"}
          </button>

          <button
            type="button"
            onClick={handleSendResetEmail}
            disabled={isDisabled}
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingReset ? "Envoi..." : "Envoyer un email de réinitialisation"}
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          Utilisez un mot de passe fort avec lettres, chiffres et caractères spéciaux.
        </p>
      </form>
    </section>
  );
}