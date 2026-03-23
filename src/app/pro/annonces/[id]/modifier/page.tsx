"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type VehicleType = "Utilitaire" | "Société" | "Tourisme";
type FuelType = "Diesel" | "Essence" | "Hybride" | "Électrique";
type TransmissionType = "Manuelle" | "Automatique" | "Semi-automatique";

type Draft = {
  title: string;
  brand: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  type: VehicleType | "";
  fuel: FuelType | "";
  transmission: TransmissionType | "";
  vatRecoverable: boolean;
  city: string;
  department: string;
  color: string;
  doors: string;
  seats: string;
  powerDin: string;
  fiscalPower: string;
  firstRegistration: string;
  description: string;
  highlights: string[];
  equipment: string[];
  maintenanceBook: boolean;
  vehicleHistory: string;
  partsAvailability: string;
};

const MAX_PHOTOS = 5;

const EQUIPMENT_CATEGORIES = [
  {
    category: "Confort",
    items: [
      "Climatisation automatique",
      "Sièges chauffants",
      "Sellerie cuir",
      "Toit ouvrant panoramique",
      "Démarrage sans clé",
    ],
  },
  {
    category: "Sécurité",
    items: [
      "Aide au stationnement",
      "Radar avant",
      "Radar arrière",
      "Caméra de recul",
      "Détecteur d’angle mort",
      "Régulateur de vitesse",
      "Limiteur de vitesse",
    ],
  },
  {
    category: "Multimédia",
    items: ["Bluetooth", "GPS", "Apple CarPlay", "Android Auto"],
  },
  {
    category: "Extérieur",
    items: ["Jantes alliage", "Feux LED", "Hayon électrique"],
  },
] as const;

function isYearValid(v: string) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 1980 && n <= new Date().getFullYear() + 1;
}

function isPositiveNumber(v: string) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

function isOptionalPositiveInteger(v: string) {
  if (!v.trim()) return true;
  const n = Number(v);
  return Number.isInteger(n) && n > 0;
}

function isOptionalDate(v: string) {
  if (!v.trim()) return true;
  return !Number.isNaN(new Date(v).getTime());
}

export default function ModifierAnnoncePage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const listingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingListing, setLoadingListing] = useState(true);
  const [step, setStep] = useState<1 | 2>(1);
  const [submitting, setSubmitting] = useState(false);

  const [draft, setDraft] = useState<Draft>({
    title: "",
    brand: "",
    model: "",
    year: "",
    mileage: "",
    price: "",
    type: "",
    fuel: "",
    transmission: "",
    vatRecoverable: false,
    city: "",
    department: "",
    color: "",
    doors: "",
    seats: "",
    powerDin: "",
    fiscalPower: "",
    firstRegistration: "",
    description: "",
    highlights: [""],
    equipment: [],
    maintenanceBook: false,
    vehicleHistory: "",
    partsAvailability: "",
  });

  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/pro/connexion");
        return;
      }

      setCheckingAuth(false);

      if (!listingId) {
        router.push("/pro/dashboard");
        return;
      }

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "GET",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Impossible de charger l’annonce.");
        router.push("/pro/dashboard");
        return;
      }

      const item = data.listing;

      setDraft({
        title: item.title ?? "",
        brand: item.brand ?? "",
        model: item.model ?? "",
        year: item.year ? String(item.year) : "",
        mileage: item.mileage ? String(item.mileage) : "",
        price: item.price ? String(item.price) : "",
        type: item.type ?? "",
        fuel: item.fuel ?? "",
        transmission: item.transmission ?? "",
        vatRecoverable: !!item.vat_recoverable,
        city: item.city ?? "",
        department: item.department ?? "",
        color: item.color ?? "",
        doors: item.doors ? String(item.doors) : "",
        seats: item.seats ? String(item.seats) : "",
        powerDin: item.power_din ? String(item.power_din) : "",
        fiscalPower: item.fiscal_power ? String(item.fiscal_power) : "",
        firstRegistration: item.first_registration ?? "",
        description: item.description ?? "",
        highlights:
          Array.isArray(item.highlights) && item.highlights.length > 0
            ? item.highlights
            : [""],
        equipment:
          Array.isArray(item.equipment) && item.equipment.length > 0
            ? item.equipment
            : [],
        maintenanceBook: !!item.maintenance_book,
        vehicleHistory: item.vehicle_history ?? "",
        partsAvailability: item.parts_availability ?? "",
      });

      setExistingPhotos(Array.isArray(item.photos) ? item.photos : []);
      setLoadingListing(false);
    }

    init();
  }, [listingId, router, supabase]);

  const photoPreviews = useMemo(() => {
    return newPhotos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [newPhotos]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [photoPreviews]);

  const cleanedHighlights = useMemo(
    () => draft.highlights.map((v) => v.trim()).filter(Boolean),
    [draft.highlights]
  );

  const cleanedEquipment = useMemo(
    () => draft.equipment.map((v) => v.trim()).filter(Boolean),
    [draft.equipment]
  );

  const selectedEquipmentByCategory = useMemo(() => {
    return EQUIPMENT_CATEGORIES.map((group) => ({
      category: group.category,
      count: group.items.filter((item) => draft.equipment.includes(item)).length,
    }));
  }, [draft.equipment]);

  const totalPhotos = existingPhotos.length + newPhotos.length;

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!draft.title.trim()) e.title = "Le titre est obligatoire.";
    if (!draft.brand.trim()) e.brand = "La marque est obligatoire.";
    if (!draft.model.trim()) e.model = "Le modèle est obligatoire.";
    if (!isYearValid(draft.year)) e.year = "Année invalide.";
    if (!isPositiveNumber(draft.mileage)) e.mileage = "Kilométrage invalide.";
    if (!isPositiveNumber(draft.price)) e.price = "Prix invalide.";
    if (!draft.type) e.type = "Le type est obligatoire.";
    if (!draft.fuel) e.fuel = "L’énergie est obligatoire.";
    if (!draft.transmission) e.transmission = "La boîte de vitesse est obligatoire.";
    if (!draft.city.trim()) e.city = "La ville est obligatoire.";
    if (!draft.department.trim()) e.department = "Le département est obligatoire.";
    if (!isOptionalPositiveInteger(draft.doors)) e.doors = "Nombre de portes invalide.";
    if (!isOptionalPositiveInteger(draft.seats)) e.seats = "Nombre de places invalide.";
    if (!isOptionalPositiveInteger(draft.powerDin)) e.powerDin = "Puissance DIN invalide.";
    if (!isOptionalPositiveInteger(draft.fiscalPower)) {
      e.fiscalPower = "Puissance fiscale invalide.";
    }
    if (!isOptionalDate(draft.firstRegistration)) {
      e.firstRegistration = "Date de première mise en circulation invalide.";
    }
    if (totalPhotos > MAX_PHOTOS) e.photos = `Maximum ${MAX_PHOTOS} photos.`;

    return e;
  }, [draft, totalPhotos]);

  const isStep1Valid = Object.keys(errors).length === 0;

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function updateArrayField(field: "highlights", index: number, value: string) {
    setDraft((prev) => {
      const next = [...prev[field]];
      next[index] = value;
      return { ...prev, [field]: next };
    });
  }

  function addArrayField(field: "highlights") {
    setDraft((prev) => ({
      ...prev,
      [field]: [...prev[field], ""],
    }));
  }

  function removeArrayField(field: "highlights", index: number) {
    setDraft((prev) => {
      const next = [...prev[field]];
      next.splice(index, 1);
      return {
        ...prev,
        [field]: next.length > 0 ? next : [""],
      };
    });
  }

  function toggleEquipment(option: string) {
    setDraft((prev) => {
      const exists = prev.equipment.includes(option);

      return {
        ...prev,
        equipment: exists
          ? prev.equipment.filter((item) => item !== option)
          : [...prev.equipment, option],
      };
    });
  }

  function autoTitle() {
    const parts = [
      draft.brand.trim(),
      draft.model.trim(),
      draft.powerDin.trim() ? `${draft.powerDin.trim()} ch` : "",
      draft.transmission ? draft.transmission : "",
      draft.type ? `(${draft.type})` : "",
    ].filter(Boolean);

    update("title", parts.join(" "));
  }

  function onPickPhotos(files: FileList | null) {
    if (!files) return;

    const arr = Array.from(files);
    const remaining = MAX_PHOTOS - existingPhotos.length - newPhotos.length;
    const allowed = arr.slice(0, Math.max(0, remaining));

    setNewPhotos((prev) => [...prev, ...allowed]);
  }

  function removeExistingPhoto(index: number) {
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function removeNewPhoto(index: number) {
    setNewPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function goNext() {
    if (!isStep1Valid) {
      alert("Merci de compléter les champs obligatoires.");
      return;
    }

    setStep(2);
  }

  function goBack() {
    setStep(1);
  }

  async function saveListing(status?: "draft" | "published") {
    setSubmitting(true);

    try {
      const uploadedPhotos: string[] = [];

      for (const file of newPhotos) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch("/api/listings/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadRes.json();

        if (!uploadRes.ok) {
          alert(uploadData.error || "Erreur lors de l’upload d’une photo.");
          return;
        }

        uploadedPhotos.push(uploadData.publicUrl);
      }

      const finalPhotos = [...existingPhotos, ...uploadedPhotos];

      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: draft.title,
          brand: draft.brand,
          model: draft.model,
          year: Number(draft.year),
          mileage: Number(draft.mileage),
          price: Number(draft.price),
          type: draft.type,
          fuel: draft.fuel,
          transmission: draft.transmission,
          vat_recoverable: draft.vatRecoverable,
          city: draft.city,
          department: draft.department,
          color: draft.color || null,
          doors: draft.doors ? Number(draft.doors) : null,
          seats: draft.seats ? Number(draft.seats) : null,
          power_din: draft.powerDin ? Number(draft.powerDin) : null,
          fiscal_power: draft.fiscalPower ? Number(draft.fiscalPower) : null,
          first_registration: draft.firstRegistration || null,
          description: draft.description,
          highlights: cleanedHighlights,
          equipment: cleanedEquipment,
          maintenance_book: draft.maintenanceBook,
          vehicle_history: draft.vehicleHistory || null,
          parts_availability: draft.partsAvailability || null,
          photos: finalPhotos,
          status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la mise à jour.");
        return;
      }

      alert("Annonce mise à jour avec succès.");
      router.push("/pro/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erreur saveListing:", error);
      alert("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth || loadingListing) {
    return (
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        Chargement de l’annonce...
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
              Modifier une annonce
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Modifiez toutes les informations de votre véhicule avant d’enregistrer.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
              onClick={() => router.push("/pro/dashboard")}
            >
              Dashboard
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          <div
            className={
              step === 1
                ? "rounded-[24px] border border-[#171311] bg-[#faf7f2] p-4"
                : "rounded-[24px] border border-[#e4ddd4] bg-white p-4 opacity-70"
            }
          >
            <p className="text-3d-soft text-xs text-slate-500">Étape 1</p>
            <p className="text-3d-title font-semibold text-black">
              Informations complètes
            </p>
          </div>
          <div
            className={
              step === 2
                ? "rounded-[24px] border border-[#171311] bg-[#faf7f2] p-4"
                : "rounded-[24px] border border-[#e4ddd4] bg-white p-4 opacity-70"
            }
          >
            <p className="text-3d-soft text-xs text-slate-500">Étape 2</p>
            <p className="text-3d-title font-semibold text-black">
              Aperçu & sauvegarde
            </p>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-3d-title text-lg font-bold tracking-tight text-black">
                Informations véhicule
              </h2>
              <button
                type="button"
                className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                onClick={autoTitle}
              >
                Générer le titre
              </button>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-3">
                <h3 className="text-3d-soft text-sm font-bold uppercase tracking-wide text-slate-500">
                  Informations principales
                </h3>

                <div className="grid gap-2">
                  <label className="text-3d-soft text-sm font-semibold text-slate-700">
                    Titre
                  </label>
                  <input
                    value={draft.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                  {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Marque
                    </label>
                    <input
                      value={draft.brand}
                      onChange={(e) => update("brand", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.brand && <p className="text-xs text-red-600">{errors.brand}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Modèle
                    </label>
                    <input
                      value={draft.model}
                      onChange={(e) => update("model", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.model && <p className="text-xs text-red-600">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Année
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.year}
                      onChange={(e) => update("year", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.year && <p className="text-xs text-red-600">{errors.year}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Kilométrage
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.mileage}
                      onChange={(e) => update("mileage", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.mileage && <p className="text-xs text-red-600">{errors.mileage}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Prix (€)
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.price}
                      onChange={(e) => update("price", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Type
                    </label>
                    <select
                      value={draft.type}
                      onChange={(e) => update("type", e.target.value as VehicleType | "")}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Choisir</option>
                      <option value="Utilitaire">Utilitaire</option>
                      <option value="Société">Société</option>
                      <option value="Tourisme">Tourisme</option>
                    </select>
                    {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Énergie
                    </label>
                    <select
                      value={draft.fuel}
                      onChange={(e) => update("fuel", e.target.value as FuelType | "")}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Choisir</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Essence">Essence</option>
                      <option value="Hybride">Hybride</option>
                      <option value="Électrique">Électrique</option>
                    </select>
                    {errors.fuel && <p className="text-xs text-red-600">{errors.fuel}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Boîte de vitesse
                    </label>
                    <select
                      value={draft.transmission}
                      onChange={(e) =>
                        update("transmission", e.target.value as TransmissionType | "")
                      }
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Choisir</option>
                      <option value="Manuelle">Manuelle</option>
                      <option value="Automatique">Automatique</option>
                      <option value="Semi-automatique">Semi-automatique</option>
                    </select>
                    {errors.transmission && (
                      <p className="text-xs text-red-600">{errors.transmission}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#e4ddd4] p-4">
                  <div>
                    <p className="text-3d-title text-sm font-semibold text-black">
                      TVA récupérable
                    </p>
                    <p className="text-3d-soft text-xs text-slate-500">
                      Afficher “TVA récupérable” sur l’annonce
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.vatRecoverable}
                    onChange={(e) => update("vatRecoverable", e.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-3d-soft text-sm font-bold uppercase tracking-wide text-slate-500">
                  Localisation
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Ville
                    </label>
                    <input
                      value={draft.city}
                      onChange={(e) => update("city", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Département
                    </label>
                    <input
                      value={draft.department}
                      onChange={(e) => update("department", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.department && (
                      <p className="text-xs text-red-600">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-3d-soft text-sm font-bold uppercase tracking-wide text-slate-500">
                  Caractéristiques techniques
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Couleur
                    </label>
                    <input
                      value={draft.color}
                      onChange={(e) => update("color", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Nombre de portes
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.doors}
                      onChange={(e) => update("doors", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.doors && <p className="text-xs text-red-600">{errors.doors}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Nombre de places
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.seats}
                      onChange={(e) => update("seats", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.seats && <p className="text-xs text-red-600">{errors.seats}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Puissance DIN (ch)
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.powerDin}
                      onChange={(e) => update("powerDin", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.powerDin && (
                      <p className="text-xs text-red-600">{errors.powerDin}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Puissance fiscale (cv)
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.fiscalPower}
                      onChange={(e) => update("fiscalPower", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.fiscalPower && (
                      <p className="text-xs text-red-600">{errors.fiscalPower}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Première mise en circulation
                    </label>
                    <input
                      type="date"
                      value={draft.firstRegistration}
                      onChange={(e) => update("firstRegistration", e.target.value)}
                      className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                    {errors.firstRegistration && (
                      <p className="text-xs text-red-600">{errors.firstRegistration}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-3d-soft text-sm font-bold uppercase tracking-wide text-slate-500">
                  Contenu de l’annonce
                </h3>

                <div className="grid gap-2">
                  <label className="text-3d-soft text-sm font-semibold text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    rows={6}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Points forts
                    </label>
                    <button
                      type="button"
                      className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                      onClick={() => addArrayField("highlights")}
                    >
                      Ajouter
                    </button>
                  </div>

                  {draft.highlights.map((value, index) => (
                    <div key={`highlight-${index}`} className="flex gap-2">
                      <input
                        value={value}
                        onChange={(e) =>
                          updateArrayField("highlights", index, e.target.value)
                        }
                        placeholder="Ex : TVA récupérable"
                        className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                      />
                      <button
                        type="button"
                        className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                        onClick={() => removeArrayField("highlights", index)}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="text-3d-soft text-sm font-semibold text-slate-700">
                      Équipements
                    </label>
                    <p className="text-3d-soft mt-1 text-xs text-slate-500">
                      Sélectionnez les équipements présents sur le véhicule.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="text-3d-button rounded-full bg-[#171311] px-3 py-1 text-xs font-semibold text-white">
                      {cleanedEquipment.length} sélectionné
                      {cleanedEquipment.length > 1 ? "s" : ""}
                    </span>

                    {selectedEquipmentByCategory.map((group) => (
                      <span
                        key={group.category}
                        className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {group.category} : {group.count}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    {EQUIPMENT_CATEGORIES.map((group) => (
                      <div
                        key={group.category}
                        className="rounded-2xl border border-[#e4ddd4] bg-[#faf7f2] p-4"
                      >
                        <div className="mb-4">
                          <h4 className="text-3d-title text-sm font-bold uppercase tracking-wide text-black">
                            {group.category}
                          </h4>
                          <p className="text-3d-soft mt-1 text-xs text-slate-500">
                            {group.items.length} équipement
                            {group.items.length > 1 ? "s" : ""} disponible
                            {group.items.length > 1 ? "s" : ""}
                          </p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {group.items.map((option) => {
                            const checked = draft.equipment.includes(option);

                            return (
                              <label
                                key={option}
                                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
                                  checked
                                    ? "border-[#171311] bg-[#171311] text-white"
                                    : "border-[#e4ddd4] bg-white text-slate-700 hover:bg-[#f7f5f2]"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleEquipment(option)}
                                  className="h-4 w-4 shrink-0 accent-black"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-3d-soft text-sm font-bold uppercase tracking-wide text-slate-500">
                  Historique et entretien
                </h3>

                <div className="flex items-center justify-between rounded-2xl border border-[#e4ddd4] p-4">
                  <div>
                    <p className="text-3d-title text-sm font-semibold text-black">
                      Carnet d’entretien disponible
                    </p>
                    <p className="text-3d-soft text-xs text-slate-500">
                      Indique si le carnet d’entretien est disponible
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.maintenanceBook}
                    onChange={(e) => update("maintenanceBook", e.target.checked)}
                    className="h-5 w-5 accent-black"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-3d-soft text-sm font-semibold text-slate-700">
                    Historique du véhicule
                  </label>
                  <input
                    value={draft.vehicleHistory}
                    onChange={(e) => update("vehicleHistory", e.target.value)}
                    placeholder="Ex : Première main, historique complet..."
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-3d-soft text-sm font-semibold text-slate-700">
                    Disponibilité des pièces
                  </label>
                  <input
                    value={draft.partsAvailability}
                    onChange={(e) => update("partsAvailability", e.target.value)}
                    placeholder="Ex : Disponible immédiatement"
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  className="text-3d-soft inline-flex w-full items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2] sm:w-auto"
                  onClick={() => saveListing("draft")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer en brouillon"}
                </button>
                <button
                  className="text-3d-button inline-flex w-full items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c] disabled:opacity-60 sm:w-auto"
                  onClick={goNext}
                  disabled={!isStep1Valid}
                >
                  Continuer
                </button>
              </div>
            </div>
          </section>

          <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-3d-title text-lg font-bold tracking-tight text-black">
              Photos
            </h2>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Ajoutez, retirez ou remplacez des photos. Maximum {MAX_PHOTOS}.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="cursor-pointer rounded-2xl border border-dashed border-[#d4ccc2] bg-white p-6 text-center transition hover:bg-[#f7f5f2]">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickPhotos(e.target.files)}
                />
                <div className="text-3d-title text-sm font-semibold text-black">
                  Ajouter des photos
                </div>
                <div className="text-3d-soft mt-1 text-xs text-slate-500">
                  JPG, PNG, WEBP • {totalPhotos}/{MAX_PHOTOS}
                </div>
              </label>

              {errors.photos && <p className="text-xs text-red-600">{errors.photos}</p>}

              {existingPhotos.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-3d-title text-sm font-semibold text-black">
                    Photos actuelles
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {existingPhotos.map((url, idx) => (
                      <div
                        key={`${url}-${idx}`}
                        className="relative overflow-hidden rounded-2xl border border-[#e4ddd4] bg-[#faf7f2]"
                      >
                        <img
                          src={url}
                          alt={`Photo actuelle ${idx + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingPhoto(idx)}
                          className="absolute right-2 top-2 rounded-lg border border-[#e4ddd4] bg-white/90 px-2 py-1 text-xs font-semibold hover:bg-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {newPhotos.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-3d-title text-sm font-semibold text-black">
                    Nouvelles photos
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photoPreviews.map((p, idx) => (
                      <div
                        key={p.url}
                        className="relative overflow-hidden rounded-2xl border border-[#e4ddd4] bg-[#faf7f2]"
                      >
                        <img
                          src={p.url}
                          alt={`Nouvelle photo ${idx + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(idx)}
                          className="absolute right-2 top-2 rounded-lg border border-[#e4ddd4] bg-white/90 px-2 py-1 text-xs font-semibold hover:bg-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingPhotos.length === 0 && newPhotos.length === 0 && (
                <div className="text-sm text-slate-500">
                  Aucune photo pour cette annonce.
                </div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-3d-title text-lg font-bold tracking-tight text-black">
              Aperçu de l’annonce
            </h2>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Vérifiez les informations avant d’enregistrer.
            </p>

            <div className="mt-5 rounded-2xl border border-[#e4ddd4] bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-3d-hero text-xl font-extrabold tracking-tight text-black">
                    {draft.title}
                  </h3>
                  <p className="text-3d-soft mt-2 text-sm text-slate-600">
                    {draft.city} ({draft.department}) • {draft.year} •{" "}
                    {Number(draft.mileage || 0).toLocaleString("fr-FR")} km
                    {draft.fuel ? ` • ${draft.fuel}` : ""}
                    {draft.transmission ? ` • ${draft.transmission}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draft.type && (
                      <span className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#171311]">
                        {draft.type}
                      </span>
                    )}
                    {draft.fuel && (
                      <span className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#171311]">
                        {draft.fuel}
                      </span>
                    )}
                    {draft.transmission && (
                      <span className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#171311]">
                        {draft.transmission}
                      </span>
                    )}
                    {draft.vatRecoverable && (
                      <span className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#171311]">
                        TVA récupérable
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-3d-title shrink-0 text-xl font-extrabold text-black">
                  {Number(draft.price || 0).toLocaleString("fr-FR")} €
                </div>
              </div>

              {(existingPhotos.length > 0 || photoPreviews.length > 0) && (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {existingPhotos.map((url, idx) => (
                    <img
                      key={`preview-existing-${url}-${idx}`}
                      src={url}
                      alt={`Photo ${idx + 1}`}
                      className="h-28 w-full rounded-xl border border-[#e4ddd4] object-cover"
                    />
                  ))}
                  {photoPreviews.map((p, idx) => (
                    <img
                      key={`preview-new-${p.url}-${idx}`}
                      src={p.url}
                      alt={`Nouvelle photo ${idx + 1}`}
                      className="h-28 w-full rounded-xl border border-[#e4ddd4] object-cover"
                    />
                  ))}
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">Marque</p>
                  <p className="text-3d-title mt-1 font-semibold text-black">{draft.brand}</p>
                </div>
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">Modèle</p>
                  <p className="text-3d-title mt-1 font-semibold text-black">{draft.model}</p>
                </div>
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">Couleur</p>
                  <p className="text-3d-title mt-1 font-semibold text-black">
                    {draft.color || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">Portes</p>
                  <p className="text-3d-title mt-1 font-semibold text-black">
                    {draft.doors || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">Places</p>
                  <p className="text-3d-title mt-1 font-semibold text-black">
                    {draft.seats || "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-[#e4ddd4] p-4">
                  <p className="text-3d-soft text-xs text-slate-500">
                    Première immatriculation
                  </p>
                  <p className="text-3d-title mt-1 font-semibold text-black">
                    {draft.firstRegistration || "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <p className="text-3d-soft text-xs text-slate-500">Points forts</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cleanedHighlights.length > 0 ? (
                      cleanedHighlights.map((item) => (
                        <span
                          key={item}
                          className="text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-xs font-medium text-[#171311]"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">Aucun point fort ajouté.</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-3d-soft text-xs text-slate-500">Équipements</p>
                  {cleanedEquipment.length > 0 ? (
                    <div className="mt-3 grid gap-4">
                      {EQUIPMENT_CATEGORIES.map((group) => {
                        const groupItems = group.items.filter((item) =>
                          cleanedEquipment.includes(item)
                        );

                        if (groupItems.length === 0) return null;

                        return (
                          <div key={group.category}>
                            <h4 className="text-3d-title text-sm font-semibold text-black">
                              {group.category}
                            </h4>
                            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                              {groupItems.map((item) => (
                                <li
                                  key={item}
                                  className="text-3d-soft rounded-xl border border-[#e4ddd4] px-4 py-3 text-sm text-slate-700"
                                >
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">Aucun équipement ajouté.</p>
                  )}
                </div>

                <div>
                  <p className="text-3d-soft text-xs text-slate-500">Description</p>
                  <p className="text-3d-soft mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {draft.description || "Aucune description."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <h3 className="text-3d-title text-base font-bold tracking-tight text-black">
                Sauvegarde
              </h3>
              <p className="text-3d-soft mt-2 text-sm text-slate-600">
                Enregistrez vos modifications ou republiez l’annonce.
              </p>

              <div className="mt-4 grid gap-2">
                <button
                  className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Modifier
                </button>
                <button
                  className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                  onClick={() => saveListing("draft")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer en brouillon"}
                </button>
                <button
                  className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c]"
                  onClick={() => saveListing("published")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Mettre à jour l’annonce"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}