"use client";

import { Suspense, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

type AccountKind = "pro" | "particulier";

function ResetPasswordContent() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [accountKind, setAccountKind] = useState<AccountKind>("particulier");

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      setCheckingSession(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const error = searchParams.get("error");

        if (error === "invalid_or_expired") {
          setErrorMessage("Le lien de réinitialisation est invalide ou a expiré.");
          setHasRecoverySession(false);
          setCheckingSession(false);
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (!mounted) return;

        if (userError || !user) {
          setErrorMessage(
            "Session de réinitialisation introuvable. Veuillez redemander un nouveau lien."
          );
          setHasRecoverySession(false);
          setCheckingSession(false);
          return;
        }

        setUserEmail(user.email ?? "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("role, account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (!mounted) return;

        const isPro =
          profile?.role === "pro" || profile?.account_type === "pro";

        setAccountKind(isPro ? "pro" : "particulier");
        setHasRecoverySession(true);
        setCheckingSession(false);
      } catch {
        if (!mounted) return;
        setErrorMessage("Impossible de vérifier le lien de réinitialisation.");
        setHasRecoverySession(false);
        setCheckingSession(false);
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [searchParams, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading || checkingSession || !hasRecoverySession) return;

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
      setErrorMessage(
        error.message || "Impossible de mettre à jour le mot de passe."
      );
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setSuccessMessage("Votre mot de passe a été réinitialisé avec succès.");

    setTimeout(() => {
      if (accountKind === "pro") {
        router.replace("/pro/connexion");
        return;
      }

      router.replace("/connexion");
    }, 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-lg text-orange-600">
            
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Réinitialiser le mot de passe
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Entrez votre nouveau mot de passe pour sécuriser votre compte.
          </p>

          {userEmail ? (
            <p className="mt-2 text-xs text-slate-500">
              Compte : <strong>{userEmail}</strong>
            </p>
          ) : null}

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
                disabled={checkingSession || !hasRecoverySession || loading}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
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
                disabled={checkingSession || !hasRecoverySession || loading}
                className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
            </div>

            {checkingSession ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Vérification du lien de réinitialisation...
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading || checkingSession || !hasRecoverySession}
              className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Enregistrement..."
                : "Enregistrer le nouveau mot de passe"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        Chargement...
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}