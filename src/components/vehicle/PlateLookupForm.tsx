"use client";

import { useState } from "react";
import VehicleResultCard from "@/components/vehicle/VehicleResultCard";
import { VehicleData } from "@/types/vehicle";

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/\s+/g, "").trim();
}

export default function PlateLookupForm() {
  const [plate, setPlate] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedPlate = normalizePlate(plate);

    if (!normalizedPlate) {
      setErrorMessage("Veuillez entrer une immatriculation.");
      setVehicle(null);
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setVehicle(null);

    try {
      const res = await fetch("/api/vehicle-by-plate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plate: normalizedPlate,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Véhicule introuvable.");
        setLoading(false);
        return;
      }

      setVehicle(data.vehicle);
    } catch {
      setErrorMessage("Erreur serveur lors de la recherche du véhicule.");
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSearch}
        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <h2 className="text-xl font-bold text-slate-900">
          Rechercher un véhicule par immatriculation
        </h2>

        <p className="mt-2 text-sm text-slate-600">
          Entrez votre plaque pour retrouver automatiquement votre véhicule.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="AA-123-BB"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-slate-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-6 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Recherche..." : "Rechercher"}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        <p className="mt-4 text-xs text-slate-500">
          Exemple : AA123BB ou AA-123-BB
        </p>
      </form>

      {vehicle ? <VehicleResultCard vehicle={vehicle} /> : null}
    </div>
  );
}