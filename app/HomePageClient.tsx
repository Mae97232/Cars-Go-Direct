"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { HomeRawListing } from "./page";
import {
  buildSearchSuggestions,
  POPULAR_SEARCH_SUGGESTIONS,
  ALL_BRAND_NAMES,
} from "@/lib/vehicle-catalog";

type AuthStatus = "guest" | "user" | "pro";
type VehicleType = "Utilitaire" | "Tourisme" | "2 roues";
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
  const rawType = (item.type || "").toLowerCase().trim();

  let safeType: VehicleType = "Tourisme";

  if (rawType.includes("utilitaire")) {
    safeType = "Utilitaire";
  } else if (
    rawType.includes("moto") ||
    rawType.includes("scooter") ||
    rawType.includes("2 roues") ||
    rawType.includes("2roues") ||
    rawType.includes("deux roues") ||
    rawType.includes("trail") ||
    rawType.includes("cross") ||
    rawType.includes("roadster") ||
    rawType.includes("sportive") ||
    rawType.includes("quad") ||
    rawType.includes("mobylette") ||
    rawType.includes("cyclo")
  ) {
    safeType = "2 roues";
  } else if (rawType.includes("tourisme")) {
    safeType = "Tourisme";
  }

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
  "inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600";

const secondaryButtonClass =
  "inline-flex h-11 items-center justify-center rounded-md border border-orange-500 bg-white px-5 text-sm font-medium text-orange-500 transition hover:bg-orange-50";

const chipClass =
  "inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600";

function HomeListingRow({
  item,
  featured = false,
}: {
  item: Listing;
  featured?: boolean;
}) {
  const photo = item.photos?.[0] || "";
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className={`group block border-b border-slate-200 transition ${
        featured ? "py-5" : "py-4"
      } hover:bg-slate-50`}
    >
      <div
        className={`grid gap-4 ${
          featured
            ? "md:grid-cols-[280px_minmax(0,1fr)]"
            : "md:grid-cols-[240px_minmax(0,1fr)]"
        }`}
      >
        <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={item.title}
              className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500">
              Photo indisponible
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
                  Professionnel
                </span>
                {item.vatRecoverable ? (
                  <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                    TVA récupérable
                  </span>
                ) : null}
              </div>

              <h3
                className={`mt-2 line-clamp-2 font-semibold text-slate-900 ${
                  featured ? "text-[22px]" : "text-[18px]"
                }`}
              >
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-600">{locationText}</p>
            </div>

            <div className="shrink-0 md:pl-4 md:text-right">
              <p
                className={`font-bold text-orange-600 ${
                  featured ? "text-[28px]" : "text-[24px]"
                }`}
              >
                {formatPrice(item.price)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-600">
            <span>{item.year || "—"}</span>
            <span>{formatKm(item.mileage)}</span>
            <span>{item.fuel || "—"}</span>
            <span>{item.type || "—"}</span>
          </div>

          <p className="mt-2 line-clamp-2 text-sm text-slate-500">
            {item.description || "Voir l’annonce complète."}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CategoryRow({
  label,
  text,
  onClick,
}: {
  label: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-slate-200 py-4 text-left transition hover:bg-slate-50"
    >
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-1 text-sm text-slate-600">{text}</p>
      </div>
      <span className="text-sm font-medium text-orange-600">Voir</span>
    </button>
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
    if (!activeType) return base.slice(0, 12);
    return base.filter((l) => l.type === activeType).slice(0, 12);
  }, [safeListings, activeType]);

  const heroListing = featuredListings[0];
  const remainingListings = featuredListings.slice(1);

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
        item.type,
      ];

      candidates.forEach((candidate) => {
        const clean = candidate.trim();
        if (!clean) return;
        if (normalize(clean).includes(term)) values.add(clean);
      });
    });

    return Array.from(values)
      .slice(0, 6)
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

    const extraVehicleTypeSuggestions =
      q.trim().length > 0
        ? [
            { label: "Utilitaire", type: "vehicleType" as const },
            { label: "Tourisme", type: "vehicleType" as const },
            { label: "2 roues", type: "vehicleType" as const },
          ].filter((item) => normalize(item.label).includes(normalize(q)))
        : [];

    const unique: { label: string; type: "model" | "brand" | "vehicleType" }[] = [];
    const seen = new Set<string>();

    for (const item of [...extraVehicleTypeSuggestions, ...base]) {
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
    const lower = normalize(trimmed);

    if (!trimmed) {
      router.push("/annonces");
      return;
    }

    if (
      lower === "2 roues" ||
      lower === "2roues" ||
      lower === "deux roues" ||
      lower === "moto" ||
      lower === "motos" ||
      lower === "scooter" ||
      lower === "scooters" ||
      lower === "quad" ||
      lower === "quads" ||
      lower === "cross" ||
      lower === "trail" ||
      lower === "roadster"
    ) {
      pushSearch({ type: "2 roues" });
      setShowSuggestions(false);
      return;
    }

    if (lower === "utilitaire" || lower === "utilitaires") {
      pushSearch({ type: "Utilitaire" });
      setShowSuggestions(false);
      return;
    }

    if (lower === "tourisme") {
      pushSearch({ type: "Tourisme" });
      setShowSuggestions(false);
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
      const lower = normalize(item.label);

      if (
        lower === "2 roues" ||
        lower === "2roues" ||
        lower === "deux roues" ||
        lower === "moto" ||
        lower === "scooter" ||
        lower === "quad" ||
        lower === "cross" ||
        lower === "trail" ||
        lower === "roadster"
      ) {
        pushSearch({ type: "2 roues" });
      } else {
        pushSearch({ q: item.label });
      }
    }

    setQ(item.label);
    setShowSuggestions(false);
  }

  const quickSearches: string[] = [];

  const popularBrands = ALL_BRAND_NAMES.slice(0, 12);

  const chips: Array<{ label: string; value: "" | Listing["type"] }> = [
    { label: "Tout", value: "" },
    { label: "Utilitaire", value: "Utilitaire" },
    { label: "Tourisme", value: "Tourisme" },
    { label: "2 roues", value: "2 roues" },
  ];

  const isGuest = initialAuthStatus === "guest";
  const isUser = initialAuthStatus === "user";
  const isPro = initialAuthStatus === "pro";

  return (
    <div className="bg-white text-slate-900">
      <section className="border-b border-slate-200 pb-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 font-medium text-orange-600">
                Marketplace auto pro
              </span>
              <span>Normandie</span>
              <span>•</span>
              <span>Garages vérifiés</span>
            </div>

            <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
              TROUVEZ VOTRE VÉHICULE RAPIDEMENT
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Véhicule de tourisme, utilitaire ou 2 roues
            </p>

            <div className="mt-5 border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <div className="relative">
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={(e) => e.key === "Enter" && goSearch(q)}
                    className="h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                    placeholder="Ex : Audi A3, Golf, Renault Master, scooter, moto…"
                  />

                  <button
                    className={primaryButtonClass}
                    onClick={() => goSearch(q)}
                  >
                    Rechercher
                  </button>
                </div>

                {showSuggestions && suggestions.length > 0 ? (
                  <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                    {suggestions.map((suggestion) => (
                      <button
                        key={`${suggestion.type}-${suggestion.label}`}
                        type="button"
                        onClick={() => goSuggestion(suggestion)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-orange-50"
                      >
                        <span className="pr-3">{suggestion.label}</span>
                        <span className="shrink-0 text-xs text-slate-400">
                          {suggestion.type === "brand"
                            ? "Marque"
                            : suggestion.type === "vehicleType"
                            ? "Type"
                            : "Véhicule"}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              {quickSearches.length > 0 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => goSearch(s)}
                      className={chipClass}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                {chips.map((c) => {
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

                        pushSearch({ type: c.value });
                      }}
                      className={
                        active
                          ? "inline-flex h-10 items-center justify-center rounded-md bg-orange-500 px-4 text-sm font-medium text-white transition hover:bg-orange-600"
                          : chipClass
                      }
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <aside className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mb-4 border-b border-slate-200 pb-4">
              <p className="text-[18px] font-semibold text-slate-900">
                Espace professionnel
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Consultez vos annonces depuis votre espace.
              </p>
            </div>

            {isGuest ? (
              <div className="grid gap-2">
                <Link href="/pro/inscription" className={primaryButtonClass}>
                  Créer un compte pro
                </Link>
                <Link href="/pro/connexion" className={secondaryButtonClass}>
                  Se connecter
                </Link>
              </div>
            ) : isPro ? (
              <div className="grid gap-2">
                <Link href="/pro/dashboard" className={primaryButtonClass}>
                  Dashboard pro
                </Link>
                <Link href="/pro/deposer" className={secondaryButtonClass}>
                  Déposer une annonce
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link href="/compte" className={primaryButtonClass}>
                  Mon compte
                </Link>
                <Link href="/annonces" className={secondaryButtonClass}>
                  Voir les annonces
                </Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {heroListing ? (
        <section className="pt-8">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-[22px] font-semibold text-slate-900">
                À la une
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Une annonce mise en avant pour donner du rythme à la page.
              </p>
            </div>

            <Link
              href="/annonces"
              className="text-sm font-medium text-orange-600 hover:underline"
            >
              Tout voir
            </Link>
          </div>

          <div className="mt-2">
            <HomeListingRow item={heroListing} featured />
          </div>
        </section>
      ) : null}

      <section className="pt-8">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-[22px] font-semibold text-slate-900">
              Dernières annonces
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Les annonces publiées récemment par les professionnels.
            </p>
          </div>

          <Link
            href="/annonces"
            className="text-sm font-medium text-orange-600 hover:underline"
          >
            Tout voir
          </Link>
        </div>

        <div className="mt-2">
          {remainingListings.length ? (
            remainingListings.map((item) => (
              <HomeListingRow key={item.id} item={item} />
            ))
          ) : (
            <div className="py-8 text-sm text-slate-600">
              Aucune annonce pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="pt-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-[22px] font-semibold text-slate-900">
                Explorer par catégorie
              </h2>
            </div>

            <div>
              <CategoryRow
                label="Utilitaire"
                text="Fourgons, fourgonnettes et véhicules pour artisans et professionnels."
                onClick={() => pushSearch({ type: "Utilitaire" })}
              />
              <CategoryRow
                label="Tourisme"
                text="Citadines, berlines, SUV et véhicules du quotidien."
                onClick={() => pushSearch({ type: "Tourisme" })}
              />
              <CategoryRow
                label="2 roues"
                text="Scooters, motos, quads, cross, trail et autres véhicules deux roues."
                onClick={() => pushSearch({ type: "2 roues" })}
              />
              <CategoryRow
                label="Toutes les annonces"
                text="Parcourir l’ensemble du catalogue disponible."
                onClick={() => router.push("/annonces")}
              />
            </div>
          </div>

          <div>
            <div className="border-b border-slate-200 pb-3">
              <h2 className="text-[22px] font-semibold text-slate-900">
                Marques populaires
              </h2>
            </div>

            <div className="flex flex-wrap gap-2 py-4">
              {popularBrands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => pushSearch({ brand })}
                  className={chipClass}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-[20px] font-semibold text-slate-900">
              {isPro
                ? "Votre espace professionnel est prêt"
                : "Développez votre visibilité avec Cars Go Direct"}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {isPro
                ? "Publiez vos annonces et suivez vos messages depuis votre espace professionnel."
                : "Publiez vos véhicules et attirez des acheteurs qualifiés."}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
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