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
    <main className="min-h-screen bg-[#f8f6f3] flex items-center justify-center px-4">
      <div className="animate-fade-up w-full max-w-md rounded-[32px] border border-[#e4ddd4] bg-white p-8 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <h1 className="text-3d-hero text-2xl font-bold tracking-tight text-black">
          Finaliser votre compte professionnel
        </h1>

        <p className="text-3d-soft mt-2 text-sm text-slate-600">
          Complétez les informations de votre garage.
        </p>

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

          <input
            required
            placeholder="SIRET (14 chiffres)"
            value={siret}
            onChange={(e) => setSiret(e.target.value)}
            className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
          />

          {errorMessage && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            disabled={loading}
            className="text-3d-button inline-flex w-full items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Activation..." : "Activer mon compte pro"}
          </button>
        </form>
      </div>
    </main>
  );
}