"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeRawListing } from "./page";
import {
  buildSearchSuggestions,
  POPULAR_SEARCH_SUGGESTIONS,
  VEHICLE_TYPES,
  ALL_BRAND_NAMES,
} from "@/lib/vehicle-catalog";

type AuthStatus = "guest" | "user" | "pro";
type VehicleType = "Utilitaire" | "Société" | "Tourisme";
type FuelType = "Diesel" | "Essence" | "Hybride" | "Électrique";

type Listing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  department: string;
  type: VehicleType;
  fuel: FuelType;
  vatRecoverable: boolean;
  photos: string[];
  description: string;
};

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function formatPrice(value: number) {
  if (!value) return "Prix non renseigné";
  return value.toLocaleString("fr-FR") + " €";
}

function formatKm(value: number) {
  if (!value) return "—";
  return value.toLocaleString("fr-FR") + " km";
}

function mapListing(item: HomeRawListing): Listing {
  const safeType: VehicleType =
    item.type === "Utilitaire" ||
    item.type === "Société" ||
    item.type === "Tourisme"
      ? item.type
      : "Tourisme";

  const safeFuel: FuelType =
    item.fuel === "Diesel" ||
    item.fuel === "Essence" ||
    item.fuel === "Hybride" ||
    item.fuel === "Électrique"
      ? item.fuel
      : "Diesel";

  return {
    id: item.id,
    title: item.title ?? "Annonce véhicule",
    brand: item.brand ?? "",
    model: item.model ?? "",
    year: item.year ?? 0,
    mileage: item.mileage ?? 0,
    price: item.price ?? 0,
    city: item.city ?? "",
    department: item.department ?? "",
    type: safeType,
    fuel: safeFuel,
    vatRecoverable: Boolean(item.vat_recoverable),
    photos: Array.isArray(item.photos) ? item.photos : [],
    description: item.description ?? "",
  };
}

const primaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#d95b00] bg-[linear-gradient(180deg,#ff7a00_0%,#ff5a00_52%,#f24a00_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.22),0_3px_0_#c63f00,0_12px_30px_rgba(242,90,0,0.24)] transition duration-200 hover:brightness-[1.03] hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_3px_0_#c63f00,0_16px_34px_rgba(242,90,0,0.28)] active:translate-y-[1px]";

const secondaryButtonClass =
  "inline-flex min-h-[48px] items-center justify-center rounded-2xl border border-[#e06600] bg-[linear-gradient(180deg,#ff8a1f_0%,#ff6a00_55%,#f25400_100%)] px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.22),0_3px_0_#c94700,0_12px_30px_rgba(242,106,0,0.22)] transition duration-200 hover:brightness-[1.03] hover:shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_3px_0_#c94700,0_16px_34px_rgba(242,106,0,0.26)] active:translate-y-[1px]";

const softPillClass =
  "text-3d-soft rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-3 py-1 text-[11px] font-medium text-[#171311]";

function HomeListingRow({ item, index = 0 }: { item: Listing; index?: number }) {
  const photo = item.photos?.[0] || "";
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="animate-fade-up group block rounded-3xl border border-slate-200 bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d9d4cd] hover:bg-white hover:shadow-[0_18px_40px_rgba(0,0,0,0.07)] sm:p-4"
      style={{ animationDelay: `${0.12 * index}s` }}
    >
      <div className="grid gap-3 sm:gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <div className="overflow-hidden rounded-2xl bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={item.title}
              className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="text-3d-soft grid aspect-[4/3] place-items-center text-sm text-slate-500">
              Photo indisponible
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <span className={softPillClass}>Professionnel</span>
                {item.vatRecoverable ? (
                  <span className={softPillClass}>TVA récupérable</span>
                ) : null}
              </div>

              <h3 className="text-3d-title mt-2 line-clamp-2 text-[16px] font-semibold tracking-tight text-black sm:text-[18px]">
                {item.title}
              </h3>

              <p className="text-3d-soft mt-1.5 text-sm text-slate-600">
                {locationText}
              </p>
            </div>

            <div className="shrink-0 sm:text-right">
              <p className="text-3d-title text-xl font-semibold tracking-tight text-black sm:text-2xl">
                {formatPrice(item.price)}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-3d-soft inline-flex rounded-full bg-[#f5f3ef] px-3 py-1.5 text-[12px] font-medium text-[#171311]">
              {item.year || "—"}
            </span>
            <span className="text-3d-soft inline-flex rounded-full bg-[#f5f3ef] px-3 py-1.5 text-[12px] font-medium text-[#171311]">
              {formatKm(item.mileage)}
            </span>
            <span className="text-3d-soft inline-flex rounded-full bg-[#f5f3ef] px-3 py-1.5 text-[12px] font-medium text-[#171311]">
              {item.fuel || "—"}
            </span>
            <span className="text-3d-soft inline-flex rounded-full bg-[#f5f3ef] px-3 py-1.5 text-[12px] font-medium text-[#171311]">
              {item.type || "—"}
            </span>
          </div>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-3d-soft line-clamp-2 text-sm text-slate-500 sm:line-clamp-1">
              {item.description || "Voir l’annonce complète."}
            </p>
            <span className="text-3d-title shrink-0 text-sm font-semibold text-black">
              Voir l’annonce
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function QuickPreviewCard({ item, index = 0 }: { item: Listing; index?: number }) {
  const photo = item.photos?.[0] || "";
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="animate-fade-up group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d9d4cd] hover:bg-white hover:shadow-[0_18px_40px_rgba(0,0,0,0.07)]"
      style={{ animationDelay: `${0.12 * index}s` }}
    >
      <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-0 sm:grid-cols-[120px_minmax(0,1fr)]">
        <div className="overflow-hidden bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={item.title}
              className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="text-3d-soft grid aspect-[4/3] place-items-center text-xs text-slate-500">
              Photo
            </div>
          )}
        </div>

        <div className="min-w-0 p-3 sm:p-4">
          <p className="text-3d-title line-clamp-2 text-sm font-semibold text-black">
            {item.title}
          </p>
          <p className="text-3d-soft mt-1 text-xs text-slate-500">
            {locationText}
          </p>
          <p className="text-3d-title mt-2 text-sm font-semibold text-black">
            {formatPrice(item.price)}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CategoryLine({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="animate-fade-up flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-4 text-left transition hover:bg-[#faf7f2] sm:py-5"
    >
      <div className="min-w-0">
        <h3 className="text-3d-title text-[15px] font-semibold text-black">
          {title}
        </h3>
        <p className="text-3d-soft mt-1 text-sm leading-6 text-slate-600">
          {subtitle}
        </p>
      </div>

      <span className="text-3d-title shrink-0 text-sm font-semibold text-black">
        Voir
      </span>
    </button>
  );
}

function BrandPill({
  brand,
  onClick,
}: {
  brand: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-3d-soft animate-fade-up whitespace-nowrap rounded-full border border-[#e4ddd4] bg-white px-4 py-2.5 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
    >
      {brand}
    </button>
  );
}

function StatCard({
  label,
  value,
  delay = 0,
}: {
  label: string;
  value: string | number;
  delay?: number;
}) {
  return (
    <div
      className="animate-fade-up rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
      style={{ animationDelay: `${delay}s` }}
    >
      <p className="text-3d-soft text-[11px] uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="text-3d-title mt-2 text-2xl font-semibold tracking-tight text-black">
        {value}
      </p>
    </div>
  );
}

export default function HomePageClient({
  initialAuthStatus,
  listings,
}: {
  initialAuthStatus: AuthStatus;
  listings: HomeRawListing[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [activeType, setActiveType] = useState<"" | Listing["type"]>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const safeListings = useMemo<Listing[]>(() => listings.map(mapListing), [listings]);

  const featuredListings = useMemo(() => {
    const base = [...safeListings];
    if (!activeType) return base.slice(0, 15);
    return base.filter((l) => l.type === activeType).slice(0, 15);
  }, [safeListings, activeType]);

  const heroPreviewListings = useMemo(() => {
    const base = activeType
      ? safeListings.filter((l) => l.type === activeType)
      : [...safeListings];

    return base.slice(0, 5);
  }, [safeListings, activeType]);

  const catalogSuggestions = useMemo(() => {
    return buildSearchSuggestions(q, 8);
  }, [q]);

  const listingSuggestions = useMemo(() => {
    const term = normalize(q);
    if (!term) return [];

    const values = new Set<string>();

    safeListings.forEach((item) => {
      const candidates = [
        item.title,
        `${item.brand} ${item.model}`.trim(),
        item.brand,
        item.model,
      ];

      candidates.forEach((candidate) => {
        const clean = candidate.trim();
        if (!clean) return;
        if (normalize(clean).includes(term)) values.add(clean);
      });
    });

    return Array.from(values)
      .slice(0, 4)
      .map((label) => ({
        label,
        type: "model" as const,
      }));
  }, [q, safeListings]);

  const suggestions = useMemo(() => {
    const base =
      q.trim().length > 0
        ? [...catalogSuggestions, ...listingSuggestions]
        : POPULAR_SEARCH_SUGGESTIONS.slice(0, 6).map((label) => ({
            label,
            type: "model" as const,
          }));

    const unique: { label: string; type: "model" | "brand" | "vehicleType" }[] = [];
    const seen = new Set<string>();

    for (const item of base) {
      const key = `${item.type}:${normalize(item.label)}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    }

    return unique.slice(0, 8);
  }, [catalogSuggestions, listingSuggestions, q]);

  function pushSearch(params: {
    q?: string;
    type?: string;
    brand?: string;
  }) {
    const searchParams = new URLSearchParams();

    if (params.q?.trim()) searchParams.set("q", params.q.trim());
    if (params.type?.trim()) searchParams.set("type", params.type.trim());
    if (params.brand?.trim()) searchParams.set("brand", params.brand.trim());

    const qs = searchParams.toString();
    router.push(qs ? `/annonces?${qs}` : "/annonces");
  }

  function goSearch(query: string) {
    const trimmed = query.trim();

    if (!trimmed) {
      router.push("/annonces");
      return;
    }

    pushSearch({ q: trimmed });
    setShowSuggestions(false);
  }

  function goSuggestion(item: {
    label: string;
    type: "model" | "brand" | "vehicleType";
  }) {
    if (item.type === "brand") {
      pushSearch({ brand: item.label });
    } else if (item.type === "vehicleType") {
      pushSearch({ type: item.label });
    } else {
      pushSearch({ q: item.label });
    }

    setQ(item.label);
    setShowSuggestions(false);
  }

  function goType(type: Listing["type"]) {
    setActiveType(type);
    pushSearch({ type });
  }

  const chips: Array<{ label: string; value: "" | Listing["type"] }> = [
    { label: "Tout", value: "" },
    { label: "Utilitaires", value: "Utilitaire" },
    { label: "Société", value: "Société" },
    { label: "Tourisme", value: "Tourisme" },
  ];

  const quickSearches = POPULAR_SEARCH_SUGGESTIONS.slice(0, 6);
  const popularBrands = ALL_BRAND_NAMES.slice(0, 12);

  const isGuest = initialAuthStatus === "guest";
  const isUser = initialAuthStatus === "user";
  const isPro = initialAuthStatus === "pro";

  return (
    <div className="space-y-8 sm:space-y-10 lg:space-y-12">
      <section className="border-b border-slate-200 pb-8 sm:pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <div className="animate-fade-up delay-100 flex flex-wrap gap-2">
              <span className={softPillClass}>Marketplace auto pro</span>
              <span className={softPillClass}>Normandie • Le Havre</span>
              <span className={softPillClass}>Garages vérifiés</span>
            </div>

            <h1 className="text-3d-hero animate-fade-up delay-200 mt-5 max-w-4xl text-[30px] font-semibold leading-[1.04] tracking-[-0.04em] text-black sm:text-[40px] lg:text-[56px]">
              Recherchez votre véhicule,
              <span className="text-3d-hero block text-black">
                simplement, rapidement.
              </span>
            </h1>

            <p className="text-3d-soft animate-fade-up delay-300 mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
              Cars Go Direct référence les véhicules de professionnels :
              utilitaires, véhicules de société et tourisme.
            </p>

            <div className="animate-fade-up delay-400 mt-6 rounded-[28px] border border-[#e4ddd4] bg-[linear-gradient(180deg,#fcfbf9_0%,#f7f5f2_100%)] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.06)] sm:p-4">
              <div className="relative">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === "Enter" && goSearch(q)}
                    className="text-3d-soft w-full rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#bdb4a8] focus:ring-4 focus:ring-[#f1ece4]"
                    placeholder="Ex : Audi A3, Golf, Renault Master…"
                  />

                  <button
                    className={`${primaryButtonClass} min-h-[52px] px-5 py-3.5 text-[15px]`}
                    onClick={() => goSearch(q)}
                  >
                    Rechercher
                  </button>
                </div>

                {showSuggestions && suggestions.length > 0 ? (
                  <div className="mt-2 rounded-2xl border border-[#e4ddd4] bg-white p-2 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
                    <div className="text-3d-soft px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Suggestions
                    </div>

                    <div className="grid">
                      {suggestions.map((suggestion) => (
                        <button
                          key={`${suggestion.type}-${suggestion.label}`}
                          type="button"
                          onClick={() => goSuggestion(suggestion)}
                          className="text-3d-soft flex items-center justify-between rounded-xl px-3 py-3 text-left text-sm text-slate-700 transition hover:bg-[#f7f5f2]"
                        >
                          <span className="pr-3">{suggestion.label}</span>
                          <span className="text-3d-soft shrink-0 text-xs text-slate-400">
                            {suggestion.type === "brand"
                              ? "Marque"
                              : suggestion.type === "vehicleType"
                              ? "Type"
                              : "Voiture"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-4 -mx-3 overflow-x-auto px-3 [scrollbar-width:none]">
                <div className="flex w-max gap-2">
                  {quickSearches.map((s, index) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => goSearch(s)}
                      className="text-3d-soft animate-fade-up whitespace-nowrap rounded-full border border-[#e4ddd4] bg-white px-4 py-2 text-sm text-[#171311] transition hover:bg-[#f7f5f2]"
                      style={{ animationDelay: `${0.45 + index * 0.05}s` }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 -mx-3 overflow-x-auto px-3 [scrollbar-width:none]">
                <div className="flex w-max gap-2">
                  {chips.map((c, index) => {
                    const active = c.value === activeType;

                    return (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => {
                          setActiveType(c.value);

                          if (c.value === "") {
                            router.push("/annonces");
                            return;
                          }

                          goType(c.value);
                        }}
                        className={
                          active
                            ? "animate-fade-up inline-flex items-center whitespace-nowrap rounded-full border border-[#d95b00] bg-[linear-gradient(180deg,#ff7a00_0%,#ff5a00_52%,#f24a00_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.22),0_3px_0_#c63f00,0_10px_24px_rgba(242,90,0,0.22)]"
                            : "text-3d-soft animate-fade-up inline-flex items-center whitespace-nowrap rounded-full border border-[#e4ddd4] bg-white px-4 py-2 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
                        }
                        style={{ animationDelay: `${0.55 + index * 0.05}s` }}
                      >
                        {c.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="animate-fade-up delay-500 mt-6 sm:mt-8">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-3d-title text-base font-semibold tracking-tight text-black sm:text-lg">
                    Aperçu rapide
                  </h2>
                  <p className="text-3d-soft mt-1 text-sm text-slate-600">
                    Quelques annonces pour démarrer.
                  </p>
                </div>

                <Link
                  href="/annonces"
                  className="text-3d-soft text-sm font-semibold text-black hover:underline"
                >
                  Tout voir
                </Link>
              </div>

              <div className="grid gap-3 sm:gap-4 xl:grid-cols-2">
                {heroPreviewListings.length > 0 ? (
                  heroPreviewListings.map((item, index) => (
                    <QuickPreviewCard key={item.id} item={item} index={index + 1} />
                  ))
                ) : (
                  <div className="text-3d-soft rounded-3xl border border-[#e4ddd4] bg-[#faf7f2] px-4 py-5 text-sm text-slate-600 xl:col-span-2">
                    Aucune annonce disponible pour le moment.
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <StatCard label="Annonces pro" value={safeListings.length} delay={0.2} />
              <StatCard label="Marques" value={`${popularBrands.length}+`} delay={0.3} />
              <StatCard label="Types" value={VEHICLE_TYPES.length} delay={0.4} />
            </div>

            <div className="animate-fade-up delay-400 rounded-[28px] border border-[#e4ddd4] bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
              {isGuest ? (
                <>
                  <h2 className="text-3d-title text-lg font-semibold tracking-tight text-black">
                    Vous êtes un garage ?
                  </h2>
                  <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
                    Publiez vos véhicules en quelques minutes et gérez vos contacts.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Link href="/pro/inscription" className={primaryButtonClass}>
                      Créer un compte pro
                    </Link>
                    <Link href="/pro/connexion" className={secondaryButtonClass}>
                      Se connecter
                    </Link>
                  </div>
                </>
              ) : isPro ? (
                <>
                  <h2 className="text-3d-title text-lg font-semibold tracking-tight text-black">
                    Votre espace pro est prêt
                  </h2>
                  <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
                    Accédez à votre dashboard, publiez vos véhicules et suivez vos messages.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Link href="/pro/dashboard" className={primaryButtonClass}>
                      Dashboard pro
                    </Link>
                    <Link href="/pro/deposer" className={secondaryButtonClass}>
                      Déposer une annonce
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3d-title text-lg font-semibold tracking-tight text-black">
                    Votre compte est connecté
                  </h2>
                  <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
                    Consultez votre compte ou passez au compte professionnel.
                  </p>

                  <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                    <Link href="/compte" className={primaryButtonClass}>
                      Mon compte
                    </Link>
                    <Link href="/annonces" className={secondaryButtonClass}>
                      Voir les annonces
                    </Link>
                  </div>
                </>
              )}
            </div>

            <div className="animate-fade-up delay-500 rounded-[28px] border border-[#e4ddd4] bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.05)]">
              <h2 className="text-3d-title text-lg font-semibold tracking-tight text-black">
                Pourquoi Cars Go Direct
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                <li className="text-3d-soft">Véhicules publiés par des professionnels</li>
                <li className="text-3d-soft">Recherche par marque, modèle, type ou localisation</li>
                <li className="text-3d-soft">Contact direct avec le vendeur</li>
                <li className="text-3d-soft">Tarification claire et sans abonnement</li>
              </ul>

              <div className="mt-5">
                <Link
                  href="/annonces"
                  className="text-3d-soft text-sm font-semibold text-black hover:underline"
                >
                  Voir toutes les annonces
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="animate-fade-up delay-300">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black sm:text-[22px]">
            Explorer par catégorie
          </h2>
          <p className="text-3d-soft mt-1 text-sm text-slate-600">
            Accédez rapidement aux grands types de véhicules.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          <CategoryLine
            title="Utilitaires"
            subtitle="Fourgons, fourgonnettes, véhicules pour artisans et pros."
            onClick={() => pushSearch({ type: "Utilitaire" })}
          />
          <CategoryLine
            title="Société"
            subtitle="Véhicules professionnels pour flotte, activité ou service."
            onClick={() => pushSearch({ type: "Société" })}
          />
          <CategoryLine
            title="Tourisme"
            subtitle="Berlines, citadines, SUV et véhicules de tous les jours."
            onClick={() => pushSearch({ type: "Tourisme" })}
          />
          <CategoryLine
            title="Toutes les annonces"
            subtitle="Parcourir tout le catalogue disponible sur la plateforme."
            onClick={() => router.push("/annonces")}
          />
        </div>
      </section>

      <section className="animate-fade-up delay-400">
        <div className="border-b border-slate-200 pb-4">
          <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black sm:text-[22px]">
            Marques populaires
          </h2>
          <p className="text-3d-soft mt-1 text-sm text-slate-600">
            Recherchez directement par constructeur automobile.
          </p>
        </div>

        <div className="py-6 -mx-1 overflow-x-auto px-1 [scrollbar-width:none] sm:overflow-visible sm:px-0">
          <div className="flex w-max gap-3 sm:w-auto sm:flex-wrap">
            {popularBrands.map((brand, index) => (
              <div
                key={brand}
                className="animate-fade-up"
                style={{ animationDelay: `${0.1 + index * 0.04}s` }}
              >
                <BrandPill brand={brand} onClick={() => pushSearch({ brand })} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="animate-fade-up delay-500">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-3d-title text-xl font-semibold tracking-tight text-black sm:text-[22px]">
              Dernières annonces
            </h2>
            <p className="text-3d-soft mt-1 text-sm text-slate-600">
              Les dernières annonces publiées par les professionnels.
            </p>
          </div>

          <Link
            href="/annonces"
            className="text-3d-soft text-sm font-semibold text-black hover:underline"
          >
            Tout voir
          </Link>
        </div>

        <div className="mt-4 space-y-3 sm:space-y-4">
          {featuredListings.length ? (
            featuredListings.map((item, index) => (
              <HomeListingRow key={item.id} item={item} index={index + 1} />
            ))
          ) : (
            <div className="text-3d-soft py-8 text-sm text-slate-600">
              Aucune annonce pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="animate-fade-up delay-600 border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h3 className="text-3d-title text-[22px] font-semibold tracking-tight text-black sm:text-[24px]">
              {isPro
                ? "Votre espace professionnel est prêt"
                : "Développez votre visibilité avec Cars Go Direct"}
            </h3>
            <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
              {isPro
                ? "Publiez vos annonces, gérez vos messages et développez votre activité locale depuis une seule plateforme."
                : "Publiez vos véhicules, attirez des acheteurs qualifiés et simplifiez la mise en relation avec votre garage."}
            </p>
          </div>

          <div className="grid w-full gap-2 sm:w-auto sm:grid-cols-2">
            {isPro ? (
              <>
                <Link href="/pro/deposer" className={primaryButtonClass}>
                  Déposer une annonce
                </Link>
                <Link href="/pro/dashboard" className={secondaryButtonClass}>
                  Dashboard pro
                </Link>
              </>
            ) : isUser ? (
              <>
                <Link href="/annonces" className={primaryButtonClass}>
                  Voir les annonces
                </Link>
                <Link href="/compte" className={secondaryButtonClass}>
                  Mon compte
                </Link>
              </>
            ) : (
              <>
                <Link href="/pro/deposer" className={primaryButtonClass}>
                  Déposer une annonce
                </Link>
                <Link href="/pro/inscription" className={secondaryButtonClass}>
                  Créer un compte pro
                </Link>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}