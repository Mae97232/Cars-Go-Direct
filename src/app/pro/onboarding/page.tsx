"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type VerifiedCompany = {
  success: boolean;
  siret: string;
  siren: string | null;
  legal_name: string | null;
  city: string | null;
  ape: string | null;
  decision: "approved";
  reason: string;
};

export default function ProOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [garageName, setGarageName] = useState("");
  const [phone, setPhone] = useState("");
  const [siret, setSiret] = useState("");
  const [company, setCompany] = useState<VerifiedCompany | null>(null);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"approved" | null>(null);

  function normalizeSiret(value: string) {
    return value.replace(/\D/g, "");
  }

  useEffect(() => {
    setCompany(null);
    setVerificationStatus(null);
    setVerificationMessage("");
  }, [siret]);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/pro/connexion");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role === "pro") {
        const { data: proAccount } = await supabase
          .from("pro_accounts")
          .select("id")
          .eq("profile_id", user.id)
          .maybeSingle();

        if (proAccount) {
          router.push("/pro/dashboard");
          return;
        }
      }

      if (profile?.full_name) {
        setGarageName(profile.full_name);
      }

      if (profile?.phone) {
        setPhone(profile.phone);
      }
    }

    loadUser();
  }, [router, supabase]);

  async function verifySiret() {
    const cleanSiret = normalizeSiret(siret);

    if (cleanSiret.length !== 14) {
      setCompany(null);
      setVerificationStatus(null);
      setVerificationMessage("Le SIRET doit contenir exactement 14 chiffres.");
      return;
    }

    setVerifying(true);
    setErrorMessage("");
    setVerificationMessage("");

    try {
      const res = await fetch("/api/verify-siret", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ siret: cleanSiret }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setCompany(null);
        setVerificationStatus(null);
        setVerificationMessage(data.reason || "SIRET invalide.");
        return;
      }

      setCompany(data);
      setVerificationStatus("approved");
      setVerificationMessage(data.reason || "Entreprise vérifiée avec succès.");

      if (!garageName.trim() && data.legal_name) {
        setGarageName(data.legal_name);
      }
    } catch {
      setCompany(null);
      setVerificationStatus(null);
      setVerificationMessage("Erreur lors de la vérification du SIRET.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (verificationStatus !== "approved" || !company) {
      setErrorMessage("Veuillez vérifier un SIRET valide avant de continuer.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const cleanSiret = normalizeSiret(siret);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("Utilisateur introuvable.");
      setLoading(false);
      return;
    }

    const finalGarageName =
      garageName.trim() || company.legal_name || "Garage professionnel";

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: finalGarageName,
        phone: phone.trim(),
        city: company.city,
        role: "pro",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      setErrorMessage(profileError.message);
      setLoading(false);
      return;
    }

    const { error: proError } = await supabase.from("pro_accounts").upsert(
      {
        profile_id: user.id,
        garage_name: finalGarageName,
        siret: cleanSiret,
        legal_name: company.legal_name,
        city: company.city,
        ape_code: company.ape,
        verification_status: "approved",
      },
      { onConflict: "profile_id" }
    );

    if (proError) {
      setErrorMessage(proError.message);
      setLoading(false);
      return;
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8f6f3] px-4">
      <div className="animate-fade-up w-full max-w-xl rounded-[32px] border border-[#e4ddd4] bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h1 className="text-3d-hero text-2xl font-bold tracking-tight text-black">
          Finaliser votre compte professionnel
        </h1>

        <p className="text-3d-soft mt-2 text-sm text-slate-600">
          Complétez les informations de votre garage et vérifiez votre SIRET.
        </p>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            placeholder="Nom du garage"
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <input
            required
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          <div className="flex gap-2">
            <input
              required
              placeholder="SIRET (14 chiffres)"
              value={siret}
              onChange={(e) => setSiret(normalizeSiret(e.target.value))}
              inputMode="numeric"
              maxLength={14}
              className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
            />

            <button
              type="button"
              onClick={verifySiret}
              disabled={verifying || loading}
              className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-[#111] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifying ? "..." : "Vérifier"}
            </button>
          </div>

          {verificationMessage ? (
            <div
              className={
                verificationStatus === "approved"
                  ? "rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                  : "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              }
            >
              {verificationMessage}
            </div>
          ) : null}

          {company && verificationStatus === "approved" ? (
            <div className="animate-fade-up rounded-[24px] border border-[#e4ddd4] bg-[#faf7f2] p-4 text-sm">
              <p className="text-3d-soft text-slate-700">
                <b className="text-black">Entreprise :</b>{" "}
                {company.legal_name || "Non renseigné"}
              </p>

              <p className="text-3d-soft mt-2 text-slate-700">
                <b className="text-black">Ville :</b>{" "}
                {company.city || "Non renseignée"}
              </p>

              <p className="text-3d-soft mt-2 text-slate-700">
                <b className="text-black">Code activité :</b>{" "}
                {company.ape || "Non renseigné"}
              </p>

              <p className="text-3d-soft mt-2 text-slate-700">
                <b className="text-black">SIRET :</b> {company.siret}
              </p>

              <p className="mt-3 text-slate-700">
                <span className="text-3d-soft">Statut vérification :</span>
                <span className="ml-2 font-semibold text-green-700">
                  validé automatiquement
                </span>
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || verifying || verificationStatus !== "approved"}
            className="text-3d-button inline-flex w-full items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Activation..." : "Activer mon compte pro"}
          </button>
        </form>
      </div>
    </main>
  );
}