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
  zip_code?: string | null;
  address?: string | null;
  ape: string | null;
  google_search_text?: string | null;
  decision: "approved";
  reason: string;
};

export default function ProOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [garageName, setGarageName] = useState("");
  const [phone, setPhone] = useState("");
  const [siret, setSiret] = useState("");
  const [address, setAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");

  const [company, setCompany] = useState<VerifiedCompany | null>(null);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<"approved" | null>(null);

  function normalizeSiret(value: string) {
    return value.replace(/\D/g, "");
  }

  function normalizeWebsite(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
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

      if (user.email) {
        setEmail(user.email);
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, phone, city, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.role !== "pro") {
        router.push("/pro/connexion");
        return;
      }

      if (profile?.onboarding_completed) {
        router.push("/pro/dashboard");
        return;
      }

      if (profile?.full_name) {
        setGarageName(profile.full_name);
      }

      if (profile?.phone) {
        setPhone(profile.phone);
      }

      if (profile?.city) {
        setCity(profile.city);
      }

      const { data: proAccount } = await supabase
        .from("pro_accounts")
        .select(
          "id, garage_name, siret, legal_name, city, ape_code, verification_status, phone, email, website, address, zip_code"
        )
        .eq("profile_id", user.id)
        .maybeSingle();

      if (proAccount?.garage_name) {
        setGarageName(proAccount.garage_name);
      }

      if (proAccount?.phone) {
        setPhone(proAccount.phone);
      }

      if (proAccount?.email) {
        setEmail(proAccount.email);
      }

      if (proAccount?.website) {
        setWebsite(proAccount.website);
      }

      if (proAccount?.address) {
        setAddress(proAccount.address);
      }

      if (proAccount?.zip_code) {
        setZipCode(proAccount.zip_code);
      }

      if (proAccount?.city) {
        setCity(proAccount.city);
      }

      if (proAccount?.siret) {
        setSiret(proAccount.siret);
      }

      if (proAccount?.verification_status === "approved" && proAccount?.siret) {
        setVerificationStatus("approved");
        setVerificationMessage("Entreprise déjà vérifiée avec succès.");
        setCompany({
          success: true,
          siret: proAccount.siret,
          siren: proAccount.siret.slice(0, 9) || null,
          legal_name: proAccount.legal_name || proAccount.garage_name || null,
          city: proAccount.city || null,
          zip_code: proAccount.zip_code || null,
          address: proAccount.address || null,
          ape: proAccount.ape_code || null,
          google_search_text: null,
          decision: "approved",
          reason: "Entreprise déjà vérifiée.",
        });
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

      const data = (await res.json()) as VerifiedCompany;

      if (!res.ok || !data.success) {
        setCompany(null);
        setVerificationStatus(null);
        setVerificationMessage(
          (data as { reason?: string }).reason || "SIRET invalide."
        );
        return;
      }

      setCompany(data);
      setVerificationStatus("approved");
      setVerificationMessage(data.reason || "Entreprise vérifiée avec succès.");

      if (!garageName.trim() && data.legal_name) {
        setGarageName(data.legal_name);
      }

      if (!city.trim() && data.city) {
        setCity(data.city);
      }

      if (!address.trim() && data.address) {
        setAddress(data.address);
      }

      if (!zipCode.trim() && data.zip_code) {
        setZipCode(data.zip_code);
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

    if (!garageName.trim()) {
      setErrorMessage("Le nom du garage est obligatoire.");
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Le téléphone est obligatoire.");
      return;
    }

    if (!city.trim()) {
      setErrorMessage("La ville est obligatoire.");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    const cleanSiret = normalizeSiret(siret);
    const normalizedWebsite = normalizeWebsite(website);

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

    const finalCity = city.trim() || company.city || "";
    const finalAddress = address.trim() || company.address || null;
    const finalZipCode = zipCode.trim() || company.zip_code || null;

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: finalGarageName,
        phone: phone.trim(),
        city: finalCity,
        role: "pro",
        onboarding_completed: true,
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
        city: finalCity,
        ape_code: company.ape,
        verification_status: "approved",
        phone: phone.trim(),
        email: email.trim() || user.email || null,
        website: normalizedWebsite || null,
        address: finalAddress,
        zip_code: finalZipCode,
      },
      { onConflict: "profile_id" }
    );

    if (proError) {
      setErrorMessage(proError.message);
      setLoading(false);
      return;
    }

    const { data: savedProAccount } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (savedProAccount?.id) {
      try {
        await fetch("/api/google-match-garage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            proAccountId: savedProAccount.id,
          }),
        });
      } catch (error) {
        console.error("GOOGLE_MATCH_LAUNCH_ERROR", error);
      }
    }

    router.push("/pro/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-white px-4 py-8 text-slate-900">
      <div className="mx-auto w-full max-w-2xl">
        <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-600">
              Espace professionnel
            </span>
            <span>Vérification entreprise</span>
            <span>•</span>
            <span>SIRET obligatoire</span>
          </div>

          <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
            Finaliser votre compte professionnel
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Complétez les informations de votre garage. Le <strong>SIRET</strong> est
            obligatoire pour vérifier votre activité. Ces informations nous serviront
            aussi plus tard à relier votre garage à sa fiche Google.
          </p>

          <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            Après validation du SIRET, votre compte pro sera activé. Nom, ville,
            adresse, téléphone et site web permettront ensuite d’identifier plus
            facilement votre établissement.
          </div>

          {errorMessage ? (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="garage-name"
                className="mb-1.5 block text-[12px] font-medium text-slate-700"
              >
                Nom du garage
              </label>
              <input
                id="garage-name"
                required
                placeholder="Nom du garage"
                value={garageName}
                onChange={(e) => setGarageName(e.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="mb-1.5 block text-[12px] font-medium text-slate-700"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  required
                  type="tel"
                  placeholder="06 00 00 00 00"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[12px] font-medium text-slate-700"
                >
                  Email professionnel
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="garage@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="siret"
                className="mb-1.5 block text-[12px] font-medium text-slate-700"
              >
                SIRET
              </label>
              <div className="flex gap-2">
                <input
                  id="siret"
                  required
                  placeholder="SIRET (14 chiffres)"
                  value={siret}
                  onChange={(e) => setSiret(normalizeSiret(e.target.value))}
                  inputMode="numeric"
                  maxLength={14}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />

                <button
                  type="button"
                  onClick={verifySiret}
                  disabled={verifying || loading}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {verifying ? "Vérification..." : "Vérifier"}
                </button>
              </div>
            </div>

            {verificationMessage ? (
              <div
                className={
                  verificationStatus === "approved"
                    ? "rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                }
              >
                {verificationMessage}
              </div>
            ) : null}

            {company && verificationStatus === "approved" ? (
              <div className="border border-slate-200 bg-slate-50 p-4 text-sm">
                <p className="text-slate-700">
                  <b className="text-slate-900">Entreprise :</b>{" "}
                  {company.legal_name || "Non renseigné"}
                </p>

                <p className="mt-2 text-slate-700">
                  <b className="text-slate-900">Adresse :</b>{" "}
                  {company.address || "Non renseignée"}
                </p>

                <p className="mt-2 text-slate-700">
                  <b className="text-slate-900">Code postal :</b>{" "}
                  {company.zip_code || "Non renseigné"}
                </p>

                <p className="mt-2 text-slate-700">
                  <b className="text-slate-900">Ville :</b>{" "}
                  {company.city || "Non renseignée"}
                </p>

                <p className="mt-2 text-slate-700">
                  <b className="text-slate-900">Code activité :</b>{" "}
                  {company.ape || "Non renseigné"}
                </p>

                <p className="mt-2 text-slate-700">
                  <b className="text-slate-900">SIRET :</b> {company.siret}
                </p>

                <p className="mt-3 text-slate-700">
                  <span>Statut vérification :</span>
                  <span className="ml-2 font-semibold text-green-700">
                    validé automatiquement
                  </span>
                </p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="mb-1.5 block text-[12px] font-medium text-slate-700"
                >
                  Adresse du garage
                </label>
                <input
                  id="address"
                  placeholder="Adresse complète"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="zip-code"
                  className="mb-1.5 block text-[12px] font-medium text-slate-700"
                >
                  Code postal
                </label>
                <input
                  id="zip-code"
                  placeholder="76600"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-1.5 block text-[12px] font-medium text-slate-700"
                >
                  Ville
                </label>
                <input
                  id="city"
                  required
                  placeholder="Le Havre"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="website"
                className="mb-1.5 block text-[12px] font-medium text-slate-700"
              >
                Site web
              </label>
              <input
                id="website"
                type="text"
                placeholder="www.mon-garage.fr"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verifying || verificationStatus !== "approved"}
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Activation..." : "Activer mon compte pro"}
            </button>

            <p className="text-center text-xs text-slate-500">
              Votre compte sera activé uniquement après validation du SIRET.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}