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
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#ece7e0] pb-5">
          <h1 className="text-3d-hero text-[28px] font-semibold tracking-tight text-black">
            Connexion et sécurité
          </h1>
          <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
            Gérez les informations de sécurité de votre compte professionnel.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="animate-fade-up rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] p-4">
            <p className="text-3d-soft text-xs uppercase tracking-wide text-slate-500">
              Adresse email
            </p>
            <p className="text-3d-title mt-2 text-sm font-medium text-black">{email}</p>
          </div>

          <div
            className="animate-fade-up rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] p-4"
            style={{ animationDelay: "0.05s" }}
          >
            <p className="text-3d-soft text-xs uppercase tracking-wide text-slate-500">
              Méthode de connexion
            </p>
            <p className="text-3d-title mt-2 text-sm font-medium text-black">{provider}</p>
          </div>

          <div
            className="animate-fade-up rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] p-4"
            style={{ animationDelay: "0.1s" }}
          >
            <p className="text-3d-soft text-xs uppercase tracking-wide text-slate-500">
              Dernière connexion
            </p>
            <p className="text-3d-title mt-2 text-sm font-medium text-black">
              {lastLoginFormatted}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="border-b border-[#ece7e0] pb-5">
          <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black">
            Modifier le mot de passe
          </h2>
          <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
            Utilisez un mot de passe fort pour sécuriser votre espace professionnel.
          </p>
        </div>

        <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="animate-fade-up md:col-span-2" style={{ animationDelay: "0.04s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-800">
                Mot de passe actuel
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                placeholder="Entrez votre mot de passe actuel"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-800">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                placeholder="Nouveau mot de passe"
              />
            </div>

            <div className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
              <label className="text-3d-soft mb-2 block text-sm font-medium text-slate-800">
                Confirmer le nouveau mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
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
              className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingUpdate ? "Mise à jour..." : "Mettre à jour le mot de passe"}
            </button>

            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={isLoading}
              className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loadingReset ? "Envoi..." : "Envoyer un email de réinitialisation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}