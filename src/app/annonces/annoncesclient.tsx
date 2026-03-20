"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Listing } from "@/lib/data";

type VehicleType = "Utilitaire" | "Société" | "Tourisme";
type FuelType = "Diesel" | "Essence" | "Hybride" | "Électrique";

export type RawListing = {
  id: string;
  title: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  price: number | null;
  city: string | null;
  department: string | null;
  type: string | null;
  fuel: string | null;
  vat_recoverable: boolean | null;
  photos: string[] | null;
  description: string | null;
};

type SortKey = "relevance" | "priceAsc" | "priceDesc" | "kmAsc" | "yearDesc";

const PAGE_SIZE = 20;

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatPrice(value: number) {
  if (!value) return "Prix non renseigné";
  return value.toLocaleString("fr-FR") + " €";
}

function formatKm(value: number) {
  if (!value) return "—";
  return value.toLocaleString("fr-FR") + " km";
}

function mapListing(item: RawListing): Listing {
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

function FilterButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-3d-soft flex h-11 w-full items-center justify-between rounded-full border border-[#e4ddd4] bg-white px-4 text-[14px] font-medium text-[#171311] transition hover:border-[#cfc5b8] hover:bg-[#f7f5f2]"
    >
      <span className="truncate">{value || label}</span>
      <span className="ml-3 text-[#7a6d60]">›</span>
    </button>
  );
}

function TopChip({
  children,
  active = false,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <span
      className={`text-3d-soft inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap ${
        active
          ? "border-[#171311] bg-[#f5f3ef] text-[#171311]"
          : "border-[#e4ddd4] bg-white text-[#4b4036]"
      }`}
    >
      {children}
    </span>
  );
}

function SearchListingCard({
  item,
  index = 0,
}: {
  item: Listing;
  index?: number;
}) {
  const photo = item.photos?.[0] || "";
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="animate-fade-up group block overflow-hidden rounded-[28px] border border-[#e7e2db] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d4ccc2] hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
      style={{ animationDelay: `${0.08 * index}s` }}
    >
      <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative overflow-hidden bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={item.title}
              className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02] md:h-full md:min-h-[220px]"
            />
          ) : (
            <div className="text-3d-soft grid aspect-[4/3] place-items-center text-sm text-slate-500 md:h-full md:min-h-[220px]">
              Photo indisponible
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="text-3d-button rounded-full bg-[#171311] px-2.5 py-1 text-[11px] font-semibold text-white shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
              À la une
            </span>
          </div>

          <button
            type="button"
            className="text-3d-soft absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#171311] shadow-sm"
          >
            ♡
          </button>
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-3d-title line-clamp-2 text-[15px] font-semibold leading-5 text-black sm:text-[17px]">
                {item.title}
              </h3>

              <div className="text-3d-title mt-2 text-[20px] font-bold leading-none text-black">
                {formatPrice(item.price)}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-3d-soft inline-flex rounded-full border border-[#171311]/15 bg-[#f5f3ef] px-2.5 py-0.5 text-[12px] font-medium text-[#171311]">
                  Pro
                </span>
                {item.vatRecoverable ? (
                  <span className="text-3d-soft inline-flex rounded-full border border-[#e4ddd4] bg-[#faf7f2] px-2.5 py-0.5 text-[12px] font-medium text-[#4b4036]">
                    TVA récupérable
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <div>
              <div className="text-3d-soft text-[12px] text-slate-500">Année</div>
              <div className="text-3d-title mt-0.5 text-[14px] font-medium text-black">
                {item.year || "—"}
              </div>
            </div>

            <div>
              <div className="text-3d-soft text-[12px] text-slate-500">Kilométrage</div>
              <div className="text-3d-title mt-0.5 text-[14px] font-medium text-black">
                {formatKm(item.mileage)}
              </div>
            </div>

            <div>
              <div className="text-3d-soft text-[12px] text-slate-500">Énergie</div>
              <div className="text-3d-title mt-0.5 text-[14px] font-medium text-black">
                {item.fuel || "—"}
              </div>
            </div>

            <div>
              <div className="text-3d-soft text-[12px] text-slate-500">Type</div>
              <div className="text-3d-title mt-0.5 text-[14px] font-medium text-black">
                {item.type || "—"}
              </div>
            </div>
          </div>

          <p className="text-3d-soft mt-4 line-clamp-2 text-[13px] leading-6 text-slate-600">
            {item.description || "Voir l’annonce complète."}
          </p>

          <div className="mt-4 flex items-start gap-3 border-t border-[#ece7e0] pt-4">
            <div className="text-3d-title grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#e4ddd4] bg-white text-[10px] font-bold text-[#171311]">
              PRO
            </div>

            <div className="min-w-0">
              <div className="text-3d-title truncate text-[13px] font-medium text-black">
                Garage partenaire
              </div>
              <div className="text-3d-soft mt-0.5 text-[12px] text-slate-500">{locationText}</div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function AnnoncesClient({
  listings,
}: {
  listings: RawListing[];
}) {
  const router = useRouter();
  const params = useSearchParams();

  const safeListings = useMemo<Listing[]>(() => listings.map(mapListing), [listings]);

  const pageParam = Number(params.get("page") ?? "1");
  const currentPage = Number.isFinite(pageParam) ? Math.max(1, pageParam) : 1;

  const queryFromUrl = params.get("q") ?? "";
  const typeFromUrl = params.get("type") ?? "";
  const brandFromUrl = params.get("brand") ?? "";
  const fuelFromUrl = params.get("fuel") ?? "";
  const locationFromUrl = params.get("location") ?? "";
  const vatOnlyFromUrl = params.get("vatOnly") === "1";
  const sortFromUrl = (params.get("sort") as SortKey | null) ?? "relevance";

  const priceMinFromUrl = params.get("priceMin");
  const priceMaxFromUrl = params.get("priceMax");
  const kmMaxFromUrl = params.get("kmMax");
  const yearMinFromUrl = params.get("yearMin");
  const yearMaxFromUrl = params.get("yearMax");

  const [filtersOpen, setFiltersOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [type, setType] = useState<"" | Listing["type"]>(
    typeFromUrl === "Utilitaire" ||
      typeFromUrl === "Société" ||
      typeFromUrl === "Tourisme"
      ? typeFromUrl
      : ""
  );
  const [brand, setBrand] = useState(brandFromUrl);
  const [fuel, setFuel] = useState<"" | Listing["fuel"]>(
    fuelFromUrl === "Diesel" ||
      fuelFromUrl === "Essence" ||
      fuelFromUrl === "Hybride" ||
      fuelFromUrl === "Électrique"
      ? fuelFromUrl
      : ""
  );
  const [vatOnly, setVatOnly] = useState(vatOnlyFromUrl);

  const [priceMin, setPriceMin] = useState<number | "">(
    priceMinFromUrl ? Number(priceMinFromUrl) : ""
  );
  const [priceMax, setPriceMax] = useState<number | "">(
    priceMaxFromUrl ? Number(priceMaxFromUrl) : ""
  );
  const [kmMax, setKmMax] = useState<number | "">(
    kmMaxFromUrl ? Number(kmMaxFromUrl) : ""
  );
  const [yearMin, setYearMin] = useState<number | "">(
    yearMinFromUrl ? Number(yearMinFromUrl) : ""
  );
  const [yearMax, setYearMax] = useState<number | "">(
    yearMaxFromUrl ? Number(yearMaxFromUrl) : ""
  );

  const [location, setLocation] = useState(locationFromUrl);
  const [sort, setSort] = useState<SortKey>(sortFromUrl);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
    setType(
      typeFromUrl === "Utilitaire" ||
        typeFromUrl === "Société" ||
        typeFromUrl === "Tourisme"
        ? typeFromUrl
        : ""
    );
    setBrand(brandFromUrl);
    setFuel(
      fuelFromUrl === "Diesel" ||
        fuelFromUrl === "Essence" ||
        fuelFromUrl === "Hybride" ||
        fuelFromUrl === "Électrique"
        ? fuelFromUrl
        : ""
    );
    setVatOnly(vatOnlyFromUrl);
    setPriceMin(priceMinFromUrl ? Number(priceMinFromUrl) : "");
    setPriceMax(priceMaxFromUrl ? Number(priceMaxFromUrl) : "");
    setKmMax(kmMaxFromUrl ? Number(kmMaxFromUrl) : "");
    setYearMin(yearMinFromUrl ? Number(yearMinFromUrl) : "");
    setYearMax(yearMaxFromUrl ? Number(yearMaxFromUrl) : "");
    setLocation(locationFromUrl);
    setSort(sortFromUrl);
  }, [
    queryFromUrl,
    typeFromUrl,
    brandFromUrl,
    fuelFromUrl,
    vatOnlyFromUrl,
    priceMinFromUrl,
    priceMaxFromUrl,
    kmMaxFromUrl,
    yearMinFromUrl,
    yearMaxFromUrl,
    locationFromUrl,
    sortFromUrl,
  ]);

  const brandOptions = useMemo(() => {
    const set = new Set<string>();

    safeListings.forEach((l) => {
      if (l.brand) set.add(l.brand);
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b, "fr"));
  }, [safeListings]);

  const results = useMemo<Listing[]>(() => {
    const query = normalize(searchQuery);

    let arr = safeListings.filter((item) => {
      if (query) {
        const haystack = [
          item.title,
          item.brand,
          item.model,
          item.type,
          item.fuel,
          item.city,
          item.department,
          item.description,
          `${item.brand} ${item.model}`,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(query)) return false;
      }

      if (location) {
        const loc = normalize(location);
        const ok =
          normalize(item.city).includes(loc) ||
          normalize(item.department).includes(loc);

        if (!ok) return false;
      }

      if (type && item.type !== type) return false;
      if (brand && normalize(item.brand) !== normalize(brand)) return false;
      if (fuel && item.fuel !== fuel) return false;
      if (vatOnly && !item.vatRecoverable) return false;

      if (priceMin !== "" && item.price < priceMin) return false;
      if (priceMax !== "" && item.price > priceMax) return false;
      if (kmMax !== "" && item.mileage > kmMax) return false;

      if (yearMin !== "" && item.year < yearMin) return false;
      if (yearMax !== "" && item.year > yearMax) return false;

      return true;
    });

    if (sort === "relevance" && query) {
      arr = [...arr].sort((a, b) => {
        const aTitle = normalize(a.title);
        const bTitle = normalize(b.title);
        const aBrandModel = normalize(`${a.brand} ${a.model}`);
        const bBrandModel = normalize(`${b.brand} ${b.model}`);

        const aExact = aTitle === query || aBrandModel === query ? 1 : 0;
        const bExact = bTitle === query || bBrandModel === query ? 1 : 0;

        if (aExact !== bExact) return bExact - aExact;

        const aStarts =
          aTitle.startsWith(query) || aBrandModel.startsWith(query) ? 1 : 0;
        const bStarts =
          bTitle.startsWith(query) || bBrandModel.startsWith(query) ? 1 : 0;

        if (aStarts !== bStarts) return bStarts - aStarts;

        return b.year - a.year;
      });
    }

    if (sort === "priceAsc") arr = [...arr].sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") arr = [...arr].sort((a, b) => b.price - a.price);
    if (sort === "kmAsc") arr = [...arr].sort((a, b) => a.mileage - b.mileage);
    if (sort === "yearDesc") arr = [...arr].sort((a, b) => b.year - a.year);

    return arr;
  }, [
    safeListings,
    searchQuery,
    location,
    type,
    brand,
    fuel,
    vatOnly,
    priceMin,
    priceMax,
    kmMax,
    yearMin,
    yearMax,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = clamp(currentPage, 1, totalPages);

  const paginatedResults = useMemo<Listing[]>(() => {
    const start = (page - 1) * PAGE_SIZE;
    return results.slice(start, start + PAGE_SIZE);
  }, [results, page]);

  const pageButtons = useMemo(() => {
    const maxButtons = 5;

    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxButtons / 2);
    let start = page - half;
    let end = page + half;

    if (start < 1) {
      start = 1;
      end = maxButtons;
    }

    if (end > totalPages) {
      end = totalPages;
      start = totalPages - maxButtons + 1;
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  function buildSearchParams(nextPage = 1) {
    const searchParams = new URLSearchParams();

    if (searchQuery.trim()) searchParams.set("q", searchQuery.trim());
    if (type) searchParams.set("type", type);
    if (brand.trim()) searchParams.set("brand", brand.trim());
    if (fuel) searchParams.set("fuel", fuel);
    if (location.trim()) searchParams.set("location", location.trim());
    if (vatOnly) searchParams.set("vatOnly", "1");
    if (priceMin !== "") searchParams.set("priceMin", String(priceMin));
    if (priceMax !== "") searchParams.set("priceMax", String(priceMax));
    if (kmMax !== "") searchParams.set("kmMax", String(kmMax));
    if (yearMin !== "") searchParams.set("yearMin", String(yearMin));
    if (yearMax !== "") searchParams.set("yearMax", String(yearMax));
    if (sort !== "relevance") searchParams.set("sort", sort);
    if (nextPage > 1) searchParams.set("page", String(nextPage));

    return searchParams.toString();
  }

  function goToPage(nextPage: number) {
    const safe = clamp(nextPage, 1, totalPages);
    const qs = buildSearchParams(safe);
    router.push(qs ? `/annonces?${qs}` : "/annonces");
  }

  function applyFilters() {
    const qs = buildSearchParams(1);
    router.push(qs ? `/annonces?${qs}` : "/annonces");
  }

  function clearFilters() {
    setSearchQuery("");
    setType("");
    setBrand("");
    setFuel("");
    setVatOnly(false);
    setPriceMin("");
    setPriceMax("");
    setKmMax("");
    setYearMin("");
    setYearMax("");
    setLocation("");
    setSort("relevance");
    router.push("/annonces");
  }

  const activeFiltersCount =
    (searchQuery ? 1 : 0) +
    (location ? 1 : 0) +
    (type ? 1 : 0) +
    (brand ? 1 : 0) +
    (fuel ? 1 : 0) +
    (vatOnly ? 1 : 0) +
    (priceMin !== "" ? 1 : 0) +
    (priceMax !== "" ? 1 : 0) +
    (kmMax !== "" ? 1 : 0) +
    (yearMin !== "" ? 1 : 0) +
    (yearMax !== "" ? 1 : 0);

  const sortLabel =
    sort === "relevance"
      ? "Pertinence"
      : sort === "priceAsc"
      ? "Prix croissant"
      : sort === "priceDesc"
      ? "Prix décroissant"
      : sort === "kmAsc"
      ? "Kilométrage croissant"
      : "Année récente";

  return (
    <div className="min-h-screen bg-[#f8f6f3]">
      <div className="container-app py-4 sm:py-5 lg:py-6">
        <div className="animate-fade-up rounded-3xl border border-[#e7e2db] bg-[#fffdf9] p-3 shadow-[0_12px_30px_rgba(0,0,0,0.04)] sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Rechercher une marque, un modèle..."
                className="text-3d-soft h-11 w-full rounded-full border border-[#e4ddd4] bg-white px-4 text-[14px] text-[#171311] outline-none transition placeholder:text-slate-400 focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
              />

              <FilterButton
                label="Localisation"
                value={location ? `📍 ${location}` : undefined}
                onClick={() => setFiltersOpen(true)}
              />

              <FilterButton
                label="Prix"
                value={
                  priceMin !== "" || priceMax !== ""
                    ? `${priceMin || 0} - ${priceMax || "∞"} €`
                    : undefined
                }
                onClick={() => setFiltersOpen(true)}
              />

              <FilterButton
                label="Marque"
                value={brand || undefined}
                onClick={() => setFiltersOpen(true)}
              />

              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="text-3d-soft flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#e4ddd4] bg-white px-4 text-[14px] font-medium text-[#171311] transition hover:border-[#cfc5b8] hover:bg-[#f7f5f2]"
              >
                <span>⚙️</span>
                <span>Filtres{activeFiltersCount ? ` (${activeFiltersCount})` : ""}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="text-3d-button h-11 rounded-full bg-[#171311] px-5 text-[14px] font-semibold text-white transition hover:bg-[#0f0d0c]"
            >
              Rechercher
            </button>
          </div>
        </div>

        <div className="animate-fade-up mt-4 overflow-x-auto [scrollbar-width:none]" style={{ animationDelay: "0.08s" }}>
          <div className="flex w-max gap-2 pr-2 sm:w-auto sm:flex-wrap">
            <TopChip active>Voitures</TopChip>
            {searchQuery ? <TopChip>Recherche : {searchQuery}</TopChip> : null}
            {type ? <TopChip>{type}</TopChip> : null}
            {brand ? <TopChip>{brand}</TopChip> : null}
            {fuel ? <TopChip>{fuel}</TopChip> : null}

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="text-3d-soft inline-flex items-center rounded-full border border-[#e4ddd4] bg-white px-3 py-1.5 text-[13px] text-[#4b4036] whitespace-nowrap hover:bg-[#f7f5f2]"
            >
              Tri : {sortLabel}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-3d-hero animate-fade-up text-[24px] font-semibold leading-tight text-black sm:text-[28px]" style={{ animationDelay: "0.12s" }}>
            {searchQuery
              ? `Résultats pour "${searchQuery}"`
              : "Annonces Voitures d'occasion"}
          </h1>

          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-3d-title animate-fade-up text-[18px] font-semibold text-black" style={{ animationDelay: "0.16s" }}>
              {results.length.toLocaleString("fr-FR")} annonces
            </p>

            <p className="text-3d-soft animate-fade-up text-[12px] text-slate-600 sm:text-right" style={{ animationDelay: "0.2s" }}>
              * Un crédit vous engage et doit être remboursé.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 sm:space-y-4">
          {results.length ? (
            paginatedResults.map((item, index) => (
              <SearchListingCard key={item.id} item={item} index={index + 1} />
            ))
          ) : (
            <div className="animate-fade-up rounded-2xl border border-[#e7e2db] bg-white p-8 text-[14px] text-slate-600">
              Aucune annonce ne correspond. Essaie d’enlever des filtres.
            </div>
          )}
        </div>

        {results.length > 0 && totalPages > 1 && (
          <div className="animate-fade-up mt-6 rounded-2xl border border-[#e7e2db] bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.04)]" style={{ animationDelay: "0.18s" }}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-3d-soft text-[13px] text-slate-600">
                Page <span className="text-3d-title font-semibold text-black">{page}</span> /{" "}
                {totalPages}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  className="text-3d-soft rounded-xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm text-[#4b4036] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => goToPage(page - 1)}
                  disabled={page <= 1}
                >
                  ← Précédent
                </button>

                {pageButtons.map((p) => (
                  <button
                    key={p}
                    className={
                      p === page
                        ? "text-3d-button rounded-xl border border-[#171311] bg-[#171311] px-4 py-2 text-sm text-white"
                        : "text-3d-soft rounded-xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm text-[#4b4036]"
                    }
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="text-3d-soft rounded-xl border border-[#e4ddd4] bg-white px-4 py-2 text-sm text-[#4b4036] disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= totalPages}
                >
                  Suivant →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {filtersOpen && (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setFiltersOpen(false)}
            aria-label="Fermer"
          />

          <aside className="fixed right-0 top-0 z-50 h-full w-[min(430px,100vw)] border-l border-[#e7e2db] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ece7e0] p-5">
              <div>
                <h2 className="text-3d-title text-[18px] font-semibold text-black">Filtres</h2>
                <p className="text-3d-soft mt-1 text-[13px] text-slate-500">
                  {activeFiltersCount} actif(s)
                </p>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="text-3d-soft rounded-full border border-[#e4ddd4] px-3 py-2 text-sm text-[#4b4036] hover:bg-[#f7f5f2]"
              >
                ✕
              </button>
            </div>

            <div className="grid h-[calc(100%-98px)] grid-rows-[1fr_auto]">
              <div className="overflow-auto p-5">
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Recherche</label>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex : Audi A3, Golf, Vito..."
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "" | Listing["type"])}
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] bg-white px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Tous</option>
                      <option value="Utilitaire">Utilitaire</option>
                      <option value="Société">Société</option>
                      <option value="Tourisme">Tourisme</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Marque</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] bg-white px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Toutes</option>
                      {brandOptions.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Énergie</label>
                    <select
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value as "" | Listing["fuel"])}
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] bg-white px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="">Toutes</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Essence">Essence</option>
                      <option value="Hybride">Hybride</option>
                      <option value="Électrique">Électrique</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-[#e4ddd4] p-4">
                    <div>
                      <p className="text-3d-title text-sm font-semibold text-black">TVA récupérable</p>
                      <p className="text-3d-soft mt-1 text-xs text-slate-500">
                        Afficher uniquement les annonces TVA
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={vatOnly}
                      onChange={(e) => setVatOnly(e.target.checked)}
                      className="h-5 w-5 accent-black"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Prix (€)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        inputMode="numeric"
                        value={priceMin}
                        onChange={(e) =>
                          setPriceMin(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Min"
                        className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                      />
                      <input
                        inputMode="numeric"
                        value={priceMax}
                        onChange={(e) =>
                          setPriceMax(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Max"
                        className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Kilométrage max</label>
                    <input
                      inputMode="numeric"
                      value={kmMax}
                      onChange={(e) =>
                        setKmMax(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Ex : 100000"
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Année</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        inputMode="numeric"
                        value={yearMin}
                        onChange={(e) =>
                          setYearMin(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Min"
                        className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                      />
                      <input
                        inputMode="numeric"
                        value={yearMax}
                        onChange={(e) =>
                          setYearMax(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Max"
                        className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">
                      Localisation (ville ou département)
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex : 76, Le Havre, Rouen"
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-3d-title text-sm font-semibold text-black">Tri</label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] bg-white px-4 text-sm text-[#171311] outline-none focus:border-[#c8bbaa] focus:ring-4 focus:ring-[#f1ece4]"
                    >
                      <option value="relevance">Pertinence</option>
                      <option value="priceAsc">Prix croissant</option>
                      <option value="priceDesc">Prix décroissant</option>
                      <option value="kmAsc">Kilométrage croissant</option>
                      <option value="yearDesc">Année récente</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-t border-[#ece7e0] p-5">
                <button
                  onClick={clearFilters}
                  className="text-3d-soft h-12 rounded-xl border border-[#e4ddd4] bg-white text-sm font-medium text-[#4b4036] hover:bg-[#f7f5f2]"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => {
                    applyFilters();
                    setFiltersOpen(false);
                  }}
                  className="text-3d-button h-12 rounded-xl bg-[#171311] text-sm font-semibold text-white hover:bg-[#0f0d0c]"
                >
                  Voir {results.length}
                </button>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}