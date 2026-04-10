"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type VehicleType = "Utilitaire" | "Tourisme" | "2 roues";
type FuelType = "Diesel" | "Essence" | "Hybride" | "Électrique";
type TransmissionType = "Manuelle" | "Automatique" | "Semi-automatique";
type TwoWheelsType =
  | "Moto"
  | "Scooter"
  | "Quad"
  | "Cross"
  | "Trail"
  | "Roadster"
  | "Sportive"
  | "Autre";

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
  newPhotos: File[];

  // 2 roues
  engineCc: string;
  twoWheelsType: TwoWheelsType | "";
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

export default function DeposerAnnoncePage() {
  const router = useRouter();
  const supabase = createClient();

  const [checkingAuth, setCheckingAuth] = useState(true);
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
    newPhotos: [],
    engineCc: "",
    twoWheelsType: "",
  });

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
    }

    init();
  }, [router, supabase]);

  const photoPreviews = useMemo(() => {
    return draft.newPhotos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [draft.newPhotos]);

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
    if (draft.newPhotos.length > MAX_PHOTOS) e.photos = "Maximum 5 photos.";

    if (draft.type === "2 roues") {
      if (!isOptionalPositiveInteger(draft.engineCc)) {
        e.engineCc = "Cylindrée invalide.";
      }
    }

    return e;
  }, [draft]);

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
      draft.type === "2 roues" && draft.engineCc.trim()
        ? `${draft.engineCc.trim()} cc`
        : "",
      draft.type === "2 roues" && draft.twoWheelsType
        ? draft.twoWheelsType
        : "",
      draft.transmission ? draft.transmission : "",
      draft.type ? `(${draft.type})` : "",
    ].filter(Boolean);

    update("title", parts.join(" "));
  }

  function onPickPhotos(files: FileList | null) {
    if (!files) return;

    const arr = Array.from(files);
    const remaining = MAX_PHOTOS - draft.newPhotos.length;
    const allowed = arr.slice(0, remaining);

    update("newPhotos", [...draft.newPhotos, ...allowed]);
  }

  function removeNewPhoto(index: number) {
    const next = [...draft.newPhotos];
    next.splice(index, 1);
    update("newPhotos", next);
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

      for (const file of draft.newPhotos) {
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

      const res = await fetch("/api/listings/create", {
        method: "POST",
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
          photos: uploadedPhotos,
          status,

          // 2 roues
          engine_cc:
            draft.type === "2 roues" && draft.engineCc.trim()
              ? Number(draft.engineCc)
              : null,
          two_wheels_type:
            draft.type === "2 roues" ? draft.twoWheelsType || null : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur lors de la création de l’annonce.");
        return;
      }

      alert(
        status === "published"
          ? "Annonce publiée avec succès."
          : "Annonce enregistrée en brouillon."
      );
      router.push("/pro/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Erreur saveListing:", error);
      alert("Erreur réseau.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        Chargement...
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-5 bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
              Déposer une annonce
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Ajoutez toutes les informations de votre véhicule avant publication.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
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
                ? "border border-orange-500 bg-orange-50 p-4"
                : "border border-slate-200 bg-white p-4 opacity-70"
            }
          >
            <p className="text-xs text-slate-500">Étape 1</p>
            <p className="font-semibold text-slate-900">Informations complètes</p>
          </div>
          <div
            className={
              step === 2
                ? "border border-orange-500 bg-orange-50 p-4"
                : "border border-slate-200 bg-white p-4 opacity-70"
            }
          >
            <p className="text-xs text-slate-500">Étape 2</p>
            <p className="font-semibold text-slate-900">Aperçu & publication</p>
          </div>
        </div>
      </div>

      {step === 1 ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr] lg:items-start">
          <section className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Informations véhicule
              </h2>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                onClick={autoTitle}
              >
                Générer le titre
              </button>
            </div>

            <div className="mt-6 grid gap-6">
              <div className="grid gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Informations principales
                </h3>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Titre</label>
                  <input
                    value={draft.title}
                    onChange={(e) => update("title", e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                  {errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Marque</label>
                    <input
                      value={draft.brand}
                      onChange={(e) => update("brand", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.brand && <p className="text-xs text-red-600">{errors.brand}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Modèle</label>
                    <input
                      value={draft.model}
                      onChange={(e) => update("model", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.model && <p className="text-xs text-red-600">{errors.model}</p>}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Année</label>
                    <input
                      inputMode="numeric"
                      value={draft.year}
                      onChange={(e) => update("year", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.year && <p className="text-xs text-red-600">{errors.year}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Kilométrage</label>
                    <input
                      inputMode="numeric"
                      value={draft.mileage}
                      onChange={(e) => update("mileage", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.mileage && <p className="text-xs text-red-600">{errors.mileage}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Prix (€)</label>
                    <input
                      inputMode="numeric"
                      value={draft.price}
                      onChange={(e) => update("price", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.price && <p className="text-xs text-red-600">{errors.price}</p>}
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Type</label>
                    <select
                      value={draft.type}
                      onChange={(e) => update("type", e.target.value as VehicleType | "")}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    >
                      <option value="">Choisir</option>
                      <option value="Utilitaire">Utilitaire</option>
                      <option value="Tourisme">Tourisme</option>
                      <option value="2 roues">2 roues</option>
                    </select>
                    {errors.type && <p className="text-xs text-red-600">{errors.type}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Énergie</label>
                    <select
                      value={draft.fuel}
                      onChange={(e) => update("fuel", e.target.value as FuelType | "")}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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
                    <label className="text-sm font-semibold text-slate-700">
                      Boîte de vitesse
                    </label>
                    <select
                      value={draft.transmission}
                      onChange={(e) =>
                        update("transmission", e.target.value as TransmissionType | "")
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
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

                {draft.type === "2 roues" ? (
                  <div className="grid gap-3 border border-slate-200 bg-slate-50 p-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Informations 2 roues
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ajoutez les détails spécifiques pour une moto, un scooter, un quad ou autre 2 roues.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Cylindrée (cc)
                        </label>
                        <input
                          inputMode="numeric"
                          value={draft.engineCc}
                          onChange={(e) => update("engineCc", e.target.value)}
                          placeholder="Ex : 125"
                          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        />
                        {errors.engineCc && (
                          <p className="text-xs text-red-600">{errors.engineCc}</p>
                        )}
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-semibold text-slate-700">
                          Type 2 roues
                        </label>
                        <select
                          value={draft.twoWheelsType}
                          onChange={(e) =>
                            update("twoWheelsType", e.target.value as TwoWheelsType | "")
                          }
                          className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                        >
                          <option value="">Choisir</option>
                          <option value="Moto">Moto</option>
                          <option value="Scooter">Scooter</option>
                          <option value="Quad">Quad</option>
                          <option value="Cross">Cross</option>
                          <option value="Trail">Trail</option>
                          <option value="Roadster">Roadster</option>
                          <option value="Sportive">Sportive</option>
                          <option value="Autre">Autre</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="flex items-center justify-between border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">TVA récupérable</p>
                    <p className="text-xs text-slate-500">
                      Afficher “TVA récupérable” sur l’annonce
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.vatRecoverable}
                    onChange={(e) => update("vatRecoverable", e.target.checked)}
                    className="h-5 w-5 accent-orange-500"
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Localisation
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Ville</label>
                    <input
                      value={draft.city}
                      onChange={(e) => update("city", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.city && <p className="text-xs text-red-600">{errors.city}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Département</label>
                    <input
                      value={draft.department}
                      onChange={(e) => update("department", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.department && (
                      <p className="text-xs text-red-600">{errors.department}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Caractéristiques techniques
                </h3>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">Couleur</label>
                    <input
                      value={draft.color}
                      onChange={(e) => update("color", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Nombre de portes
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.doors}
                      onChange={(e) => update("doors", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.doors && <p className="text-xs text-red-600">{errors.doors}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Nombre de places
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.seats}
                      onChange={(e) => update("seats", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.seats && <p className="text-xs text-red-600">{errors.seats}</p>}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Puissance DIN (ch)
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.powerDin}
                      onChange={(e) => update("powerDin", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.powerDin && (
                      <p className="text-xs text-red-600">{errors.powerDin}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Puissance fiscale (cv)
                    </label>
                    <input
                      inputMode="numeric"
                      value={draft.fiscalPower}
                      onChange={(e) => update("fiscalPower", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.fiscalPower && (
                      <p className="text-xs text-red-600">{errors.fiscalPower}</p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Première mise en circulation
                    </label>
                    <input
                      type="date"
                      value={draft.firstRegistration}
                      onChange={(e) => update("firstRegistration", e.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    />
                    {errors.firstRegistration && (
                      <p className="text-xs text-red-600">{errors.firstRegistration}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Contenu de l’annonce
                </h3>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">Description</label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => update("description", e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    rows={6}
                  />
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <label className="text-sm font-semibold text-slate-700">Points forts</label>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                      onClick={() => addArrayField("highlights")}
                    >
                      Ajouter
                    </button>
                  </div>

                  {draft.highlights.map((value, index) => (
                    <div key={`highlight-${index}`} className="flex gap-2">
                      <input
                        value={value}
                        onChange={(e) => updateArrayField("highlights", index, e.target.value)}
                        placeholder="Ex : TVA récupérable"
                        className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                        onClick={() => removeArrayField("highlights", index)}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Équipements</label>
                    <p className="mt-1 text-xs text-slate-500">
                      Sélectionnez les équipements présents sur le véhicule.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
                      {cleanedEquipment.length} sélectionné
                      {cleanedEquipment.length > 1 ? "s" : ""}
                    </span>

                    {selectedEquipmentByCategory.map((group) => (
                      <span
                        key={group.category}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {group.category} : {group.count}
                      </span>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    {EQUIPMENT_CATEGORIES.map((group) => (
                      <div
                        key={group.category}
                        className="border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
                      >
                        <div className="mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
                            {group.category}
                          </h4>
                          <p className="mt-1 text-xs text-slate-500">
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
                                className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition ${
                                  checked
                                    ? "border-orange-500 bg-orange-50 text-orange-700"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleEquipment(option)}
                                  className="h-4 w-4 shrink-0 accent-orange-500"
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
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Historique et entretien
                </h3>

                <div className="flex items-center justify-between border border-slate-200 p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Carnet d’entretien disponible
                    </p>
                    <p className="text-xs text-slate-500">
                      Indique si le carnet d’entretien est disponible
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.maintenanceBook}
                    onChange={(e) => update("maintenanceBook", e.target.checked)}
                    className="h-5 w-5 accent-orange-500"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Historique du véhicule
                  </label>
                  <input
                    value={draft.vehicleHistory}
                    onChange={(e) => update("vehicleHistory", e.target.value)}
                    placeholder="Ex : Première main, historique complet..."
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>

                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Disponibilité des pièces
                  </label>
                  <input
                    value={draft.partsAvailability}
                    onChange={(e) => update("partsAvailability", e.target.value)}
                    placeholder="Ex : Disponible immédiatement"
                    className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2 sm:flex-row">
                <button
                  className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:w-auto"
                  onClick={() => saveListing("draft")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer en brouillon"}
                </button>
                <button
                  className="inline-flex w-full items-center justify-center rounded-md bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-60 sm:w-auto"
                  onClick={goNext}
                  disabled={!isStep1Valid}
                >
                  Continuer
                </button>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Photos
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Ajoutez jusqu’à {MAX_PHOTOS} photos. La première sera la photo principale.
            </p>

            <div className="mt-4 grid gap-3">
              <label className="cursor-pointer border border-dashed border-slate-300 bg-white p-6 text-center transition hover:bg-slate-50">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onPickPhotos(e.target.files)}
                />
                <div className="text-sm font-semibold text-slate-900">
                  Ajouter des photos
                </div>
                <div className="mt-1 text-xs text-slate-500">
                  JPG, PNG • 5 maximum
                </div>
              </label>

              {errors.photos && <p className="text-xs text-red-600">{errors.photos}</p>}

              {draft.newPhotos.length > 0 && (
                <div className="grid gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Nouvelles photos
                  </p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photoPreviews.map((p, idx) => (
                      <div
                        key={p.url}
                        className="relative overflow-hidden border border-slate-200 bg-slate-50"
                      >
                        <img
                          src={p.url}
                          alt={`Nouvelle photo ${idx + 1}`}
                          className="h-28 w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewPhoto(idx)}
                          className="absolute right-2 top-2 rounded-md border border-slate-200 bg-white/90 px-2 py-1 text-xs font-semibold hover:bg-white"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {draft.newPhotos.length === 0 && (
                <div className="text-sm text-slate-500">Aucune photo ajoutée.</div>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr] lg:items-start">
          <section className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Aperçu de l’annonce
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Vérifiez les informations avant publication.
            </p>

            <div className="mt-5 border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                    {draft.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {draft.city} ({draft.department}) • {draft.year} •{" "}
                    {Number(draft.mileage || 0).toLocaleString("fr-FR")} km
                    {draft.fuel ? ` • ${draft.fuel}` : ""}
                    {draft.transmission ? ` • ${draft.transmission}` : ""}
                    {draft.type === "2 roues" && draft.engineCc
                      ? ` • ${draft.engineCc} cc`
                      : ""}
                    {draft.type === "2 roues" && draft.twoWheelsType
                      ? ` • ${draft.twoWheelsType}`
                      : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {draft.type && (
                      <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-600">
                        {draft.type}
                      </span>
                    )}
                    {draft.fuel && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {draft.fuel}
                      </span>
                    )}
                    {draft.transmission && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {draft.transmission}
                      </span>
                    )}
                    {draft.vatRecoverable && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        TVA récupérable
                      </span>
                    )}
                    {draft.type === "2 roues" && draft.twoWheelsType && (
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {draft.twoWheelsType}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0 text-xl font-bold text-orange-600">
                  {Number(draft.price || 0).toLocaleString("fr-FR")} €
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Marque</p>
                  <p className="mt-1 font-semibold text-slate-900">{draft.brand}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Modèle</p>
                  <p className="mt-1 font-semibold text-slate-900">{draft.model}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Couleur</p>
                  <p className="mt-1 font-semibold text-slate-900">{draft.color || "—"}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Portes</p>
                  <p className="mt-1 font-semibold text-slate-900">{draft.doors || "—"}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Places</p>
                  <p className="mt-1 font-semibold text-slate-900">{draft.seats || "—"}</p>
                </div>
                <div className="border border-slate-200 p-4">
                  <p className="text-xs text-slate-500">Première immatriculation</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {draft.firstRegistration || "—"}
                  </p>
                </div>
                {draft.type === "2 roues" ? (
                  <>
                    <div className="border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Cylindrée</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {draft.engineCc ? `${draft.engineCc} cc` : "—"}
                      </p>
                    </div>
                    <div className="border border-slate-200 p-4">
                      <p className="text-xs text-slate-500">Type 2 roues</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {draft.twoWheelsType || "—"}
                      </p>
                    </div>
                  </>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4">
                <div>
                  <p className="text-xs text-slate-500">Points forts</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cleanedHighlights.length > 0 ? (
                      cleanedHighlights.map((item) => (
                        <span
                          key={item}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
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
                  <p className="text-xs text-slate-500">Équipements</p>
                  {cleanedEquipment.length > 0 ? (
                    <div className="mt-3 grid gap-4">
                      {EQUIPMENT_CATEGORIES.map((group) => {
                        const groupItems = group.items.filter((item) =>
                          cleanedEquipment.includes(item)
                        );

                        if (groupItems.length === 0) return null;

                        return (
                          <div key={group.category}>
                            <h4 className="text-sm font-semibold text-slate-900">
                              {group.category}
                            </h4>
                            <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                              {groupItems.map((item) => (
                                <li
                                  key={item}
                                  className="border border-slate-200 px-4 py-3 text-sm text-slate-700"
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
                  <p className="text-xs text-slate-500">Description</p>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {draft.description || "Aucune description."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="grid gap-5">
            <section className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <h3 className="text-base font-semibold tracking-tight text-slate-900">
                Publication
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Enregistrez votre annonce en brouillon ou publiez-la.
              </p>

              <div className="mt-4 grid gap-2">
                <button
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                  onClick={goBack}
                  disabled={submitting}
                >
                  Modifier
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                  onClick={() => saveListing("draft")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Enregistrer en brouillon"}
                </button>
                <button
                  className="inline-flex items-center justify-center rounded-md bg-orange-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-orange-600"
                  onClick={() => saveListing("published")}
                  disabled={submitting}
                >
                  {submitting ? "Enregistrement..." : "Publier l’annonce"}
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}