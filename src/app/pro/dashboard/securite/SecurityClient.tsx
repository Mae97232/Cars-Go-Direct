"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
  provider: string;
  lastLoginFormatted: string;
};

export default function SecurityClient({
  email,
  provider,
  lastLoginFormatted,
}: Props) {
  const supabase = createClient();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingReset, setLoadingReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoadingUpdate(true);
    setSuccessMessage("");
    setErrorMessage("");

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
    setLoadingReset(true);
    setSuccessMessage("");
    setErrorMessage("");

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

  const isLoading = loadingUpdate || loadingReset;

  return (
    <div className="space-y-8">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h1 className="text-[28px] font-semibold tracking-tight text-slate-950">
            Connexion et sécurité
          </h1>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Gérez les informations de sécurité de votre compte professionnel.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Adresse email
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">{email}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Méthode de connexion
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">{provider}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Dernière connexion
            </p>
            <p className="mt-2 text-sm font-medium text-slate-900">
              {lastLoginFormatted}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="border-b border-slate-200 pb-5">
          <h2 className="text-xl font-semibold tracking-tight text-slate-950">
            Modifier le mot de passe
          </h2>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Utilisez un mot de passe fort pour sécuriser votre espace professionnel.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Nouveau mot de passe"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-800">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                placeholder="Confirmez le mot de passe"
              />
            </div>
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

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingUpdate ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingReset ? "Envoi..." : "Envoyer un email de réinitialisation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}