"use client";

import { useState } from "react";
import Link from "next/link";
import AuthProviders from "@/components/AuthProviders";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function InscriptionPro() {
  const [loading, setLoading] = useState(false);
  const [siret, setSiret] = useState("");
  const [company, setCompany] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();
  const supabase = createClient();

  async function verifySiret() {
    if (!siret || siret.replace(/\D/g, "").length !== 14) {
      alert("Le SIRET doit contenir 14 chiffres.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/verify-siret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siret }),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.reason || "SIRET invalide.");
        setCompany(null);
        setVerificationStatus(null);
        setLoading(false);
        return;
      }

      setCompany(data);
      setVerificationStatus("approved");
      alert("SIRET vérifié. Compte professionnel validable automatiquement.");
    } catch {
      alert("Erreur lors de la vérification du SIRET.");
      setCompany(null);
      setVerificationStatus(null);
    }

    setLoading(false);
  }

  async function signup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (verificationStatus !== "approved") {
      alert("Veuillez vérifier un SIRET valide avant de continuer.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const formData = new FormData(e.currentTarget);

    const garageName = String(formData.get("garage_name") ?? "");
    const email = String(formData.get("email") ?? "");
    const phone = String(formData.get("phone") ?? "");
    const password = String(formData.get("password") ?? "");

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          role: "pro",
          garage_name: garageName,
          phone,
          siret: company?.siret ?? siret,
          legal_name: company?.legal_name ?? null,
          city: company?.city ?? null,
          ape: company?.ape ?? null,
          verification_status: "approved",
        },
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      alert("Compte créé, mais impossible de récupérer l’utilisateur.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: garageName,
        phone,
        role: "pro",
      })
      .eq("id", userId);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    const { error: proError } = await supabase.from("pro_accounts").upsert(
      {
        profile_id: userId,
        garage_name: garageName,
        siret: company?.siret ?? siret,
        legal_name: company?.legal_name ?? null,
        city: company?.city ?? null,
        ape_code: company?.ape ?? null,
        verification_status: "approved",
      },
      {
        onConflict: "profile_id",
      }
    );

    if (proError) {
      alert(proError.message);
      setLoading(false);
      return;
    }

    alert(
      "Compte professionnel créé et validé automatiquement. Vous pouvez maintenant vous connecter et déposer des annonces."
    );

    setLoading(false);
    router.push("/pro/connexion");
  }

  async function signupGoogle() {
    setLoading(true);
    setErrorMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/pro/onboarding`,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="card p-6">
        <h1 className="text-xl font-bold tracking-tight">
          Créer un compte professionnel
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Réservé aux garages et professionnels. Vérification SIRET obligatoire.
        </p>

        <div className="mt-6">
          <AuthProviders
            mode="signup"
            onGoogle={signupGoogle}
            loading={loading}
          />
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={signup} className="grid gap-3 mt-5">
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="garage_name"
              required
              placeholder="Nom du garage"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />

            <div className="flex gap-2">
              <input
                required
                placeholder="SIRET"
                value={siret}
                onChange={(e) => setSiret(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
              />

              <button
                type="button"
                onClick={verifySiret}
                className="btn btn-secondary"
              >
                Vérifier
              </button>
            </div>
          </div>

          {company && (
            <div className="card p-4 mt-2 text-sm">
              <p>
                <b>Entreprise :</b> {company.legal_name}
              </p>

              <p>
                <b>Ville :</b> {company.city}
              </p>

              <p>
                <b>Code activité :</b> {company.ape}
              </p>

              <p className="mt-2">
                Statut vérification :
                <span className="ml-2 font-semibold text-green-700">
                  validé automatiquement
                </span>
              </p>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              name="email"
              required
              type="email"
              placeholder="Email"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />

            <input
              name="phone"
              required
              type="tel"
              placeholder="Téléphone"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <input
            name="password"
            required
            type="password"
            placeholder="Mot de passe"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
          />

          <button disabled={loading} className="btn btn-primary mt-2">
            {loading ? "Création..." : "Créer le compte"}
          </button>

          <p className="text-xs text-slate-500 mt-2">
            Une fois le SIRET validé, votre compte professionnel est activé
            automatiquement.
          </p>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link
              href="/pro/connexion"
              className="font-medium text-slate-900 hover:underline"
            >
              Déjà un compte ? Se connecter
            </Link>
          </div>

          <div className="mt-3 text-center text-sm text-slate-600">
            <Link
              href="/inscription"
              className="font-medium text-slate-900 hover:underline"
            >
              Vous êtes particulier ? Créer un compte particulier
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}