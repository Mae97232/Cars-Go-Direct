"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProOnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [garageName, setGarageName] = useState("");
  const [phone, setPhone] = useState("");
  const [siret, setSiret] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const cleanSiret = siret.replace(/\D/g, "");

    if (cleanSiret.length !== 14) {
      setErrorMessage("Le SIRET doit contenir 14 chiffres.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("Utilisateur introuvable.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        full_name: garageName,
        phone,
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
        garage_name: garageName,
        siret: cleanSiret,
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
  }

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-3xl border border-slate-200 p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Finaliser votre compte professionnel
        </h1>

        <p className="text-sm text-slate-600 mt-2">
          Complétez les informations de votre garage.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <input
            required
            placeholder="Nom du garage"
            value={garageName}
            onChange={(e) => setGarageName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />

          <input
            required
            type="tel"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />

          <input
            required
            placeholder="SIRET (14 chiffres)"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          />

          {errorMessage && (
            <div className="text-sm text-red-600">{errorMessage}</div>
          )}

          <button
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-3 text-sm font-medium"
          >
            {loading ? "Activation..." : "Activer mon compte pro"}
          </button>
        </form>
      </div>
    </main>
  );
}