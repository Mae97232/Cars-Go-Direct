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
      className="flex h-11 w-full items-center justify-between rounded-full border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
    >
      <span className="truncate">{value || label}</span>
      <span className="ml-3 text-slate-500">›</span>
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
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-[13px] whitespace-nowrap ${
        active
          ? "border-slate-800 bg-slate-100 text-slate-900"
          : "border-slate-300 bg-white text-slate-700"
      }`}
    >
      {children}
    </span>
  );
}

function SearchListingCard({ item }: { item: Listing }) {
  const photo = item.photos?.[0] || "";
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="grid gap-0 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="relative overflow-hidden bg-slate-100">
          {photo ? (
            <img
              src={photo}
              alt={item.title}
              className="aspect-[4/3] w-full object-cover md:h-full md:min-h-[220px]"
            />
          ) : (
            <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500 md:h-full md:min-h-[220px]">
              Photo indisponible
            </div>
          )}

          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-fuchsia-600 px-2.5 py-1 text-[11px] font-semibold text-white">
              À la une
            </span>
          </div>

          <button
            type="button"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-slate-600 shadow-sm"
          >
            ♡
          </button>
        </div>

        <div className="min-w-0 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-[15px] font-semibold leading-5 text-slate-900 sm:text-[17px]">
                {item.title}
              </h3>

              <div className="mt-2 text-[20px] font-bold leading-none text-emerald-700">
                {formatPrice(item.price)}
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                <span className="inline-flex rounded-full border border-sky-300 px-2.5 py-0.5 text-[12px] font-medium text-sky-700">
                  Pro
                </span>
                {item.vatRecoverable ? (
                  <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[12px] font-medium text-slate-700">
                    TVA récupérable
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
            <div>
              <div className="text-[12px] text-slate-500">Année</div>
              <div className="mt-0.5 text-[14px] font-medium text-slate-900">
                {item.year || "—"}
              </div>
            </div>

            <div>
              <div className="text-[12px] text-slate-500">Kilométrage</div>
              <div className="mt-0.5 text-[14px] font-medium text-slate-900">
                {formatKm(item.mileage)}
              </div>
            </div>

            <div>
              <div className="text-[12px] text-slate-500">Énergie</div>
              <div className="mt-0.5 text-[14px] font-medium text-slate-900">
                {item.fuel || "—"}
              </div>
            </div>

            <div>
              <div className="text-[12px] text-slate-500">Type</div>
              <div className="mt-0.5 text-[14px] font-medium text-slate-900">
                {item.type || "—"}
              </div>
            </div>
          </div>

          <p className="mt-4 line-clamp-2 text-[13px] leading-6 text-slate-600">
            {item.description || "Voir l’annonce complète."}
          </p>

          <div className="mt-4 flex items-start gap-3 border-t border-slate-200 pt-4">
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-[10px] font-bold text-slate-700">
              PRO
            </div>

            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-slate-900">
                Garage partenaire
              </div>
              <div className="mt-0.5 text-[12px] text-slate-500">{locationText}</div>
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
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="container-app py-4 sm:py-5 lg:py-6">
        <div className="rounded-3xl border border-slate-200 bg-[#fffdf9] p-3 sm:p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_repeat(4,minmax(0,1fr))]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                placeholder="Rechercher une marque, un modèle..."
                className="h-11 w-full rounded-full border border-slate-300 bg-white px-4 text-[14px] outline-none"
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
                className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                <span>⚙️</span>
                <span>Filtres{activeFiltersCount ? ` (${activeFiltersCount})` : ""}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={applyFilters}
              className="h-11 rounded-full bg-orange-500 px-5 text-[14px] font-semibold text-white transition hover:bg-orange-600"
            >
              Rechercher
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto [scrollbar-width:none]">
          <div className="flex w-max gap-2 pr-2 sm:w-auto sm:flex-wrap">
            <TopChip active>Voitures</TopChip>
            {searchQuery ? <TopChip>Recherche : {searchQuery}</TopChip> : null}
            {type ? <TopChip>{type}</TopChip> : null}
            {brand ? <TopChip>{brand}</TopChip> : null}
            {fuel ? <TopChip>{fuel}</TopChip> : null}

            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[13px] text-slate-700 whitespace-nowrap"
            >
              Tri : {sortLabel}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <h1 className="text-[24px] font-semibold leading-tight text-slate-900 sm:text-[28px]">
            {searchQuery
              ? `Résultats pour "${searchQuery}"`
              : "Annonces Voitures d'occasion"}
          </h1>

          <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <p className="text-[18px] font-semibold text-slate-800">
              {results.length.toLocaleString("fr-FR")} annonces
            </p>

            <p className="text-[12px] text-slate-600 sm:text-right">
              * Un crédit vous engage et doit être remboursé.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 sm:space-y-4">
          {results.length ? (
            paginatedResults.map((item) => (
              <SearchListingCard key={item.id} item={item} />
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-[14px] text-slate-600">
              Aucune annonce ne correspond. Essaie d’enlever des filtres.
            </div>
          )}
        </div>

        {results.length > 0 && totalPages > 1 && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] text-slate-600">
                Page <span className="font-semibold text-slate-900">{page}</span> /{" "}
                {totalPages}
              </p>

              <div className="flex flex-wrap gap-2">
                <button
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
                        ? "rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm text-white"
                        : "rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700"
                    }
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <aside className="fixed right-0 top-0 z-50 h-full w-[min(430px,100vw)] border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-[18px] font-semibold text-slate-900">Filtres</h2>
                <p className="mt-1 text-[13px] text-slate-500">
                  {activeFiltersCount} actif(s)
                </p>
              </div>
              <button
                onClick={() => setFiltersOpen(false)}
                className="rounded-full border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="grid h-[calc(100%-98px)] grid-rows-[1fr_auto]">
              <div className="overflow-auto p-5">
                <div className="grid gap-5">
                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Recherche</label>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ex : Audi A3, Golf, Vito..."
                      className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as "" | Listing["type"])}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
                    >
                      <option value="">Tous</option>
                      <option value="Utilitaire">Utilitaire</option>
                      <option value="Société">Société</option>
                      <option value="Tourisme">Tourisme</option>
                    </select>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Marque</label>
                    <select
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
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
                    <label className="text-sm font-semibold">Énergie</label>
                    <select
                      value={fuel}
                      onChange={(e) => setFuel(e.target.value as "" | Listing["fuel"])}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
                    >
                      <option value="">Toutes</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Essence">Essence</option>
                      <option value="Hybride">Hybride</option>
                      <option value="Électrique">Électrique</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-slate-300 p-4">
                    <div>
                      <p className="text-sm font-semibold">TVA récupérable</p>
                      <p className="mt-1 text-xs text-slate-500">
                        Afficher uniquement les annonces TVA
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={vatOnly}
                      onChange={(e) => setVatOnly(e.target.checked)}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Prix (€)</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        inputMode="numeric"
                        value={priceMin}
                        onChange={(e) =>
                          setPriceMin(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Min"
                        className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                      />
                      <input
                        inputMode="numeric"
                        value={priceMax}
                        onChange={(e) =>
                          setPriceMax(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Max"
                        className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Kilométrage max</label>
                    <input
                      inputMode="numeric"
                      value={kmMax}
                      onChange={(e) =>
                        setKmMax(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="Ex : 100000"
                      className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Année</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        inputMode="numeric"
                        value={yearMin}
                        onChange={(e) =>
                          setYearMin(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Min"
                        className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                      />
                      <input
                        inputMode="numeric"
                        value={yearMax}
                        onChange={(e) =>
                          setYearMax(e.target.value === "" ? "" : Number(e.target.value))
                        }
                        placeholder="Max"
                        className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">
                      Localisation (ville ou département)
                    </label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex : 76, Le Havre, Rouen"
                      className="h-12 rounded-xl border border-slate-300 px-4 text-sm outline-none"
                    />
                  </div>

                  <div className="grid gap-2">
                    <label className="text-sm font-semibold">Tri</label>
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as SortKey)}
                      className="h-12 rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none"
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

              <div className="grid grid-cols-2 gap-3 border-t border-slate-200 p-5">
                <button
                  onClick={clearFilters}
                  className="h-12 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-700"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => {
                    applyFilters();
                    setFiltersOpen(false);
                  }}
                  className="h-12 rounded-xl bg-orange-500 text-sm font-semibold text-white hover:bg-orange-600"
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