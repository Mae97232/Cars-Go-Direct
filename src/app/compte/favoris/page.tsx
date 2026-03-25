"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type FavoriteListing = {
  id: string;
  title: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  mileage: number | null;
  price: number | null;
  city: string | null;
  department: string | null;
  fuel: string | null;
  type: string | null;
  photos: string[] | null;
  description: string | null;
};

function formatPrice(value: number | null) {
  if (!value) return "Prix non renseigné";
  return value.toLocaleString("fr-FR") + " €";
}

function formatKm(value: number | null) {
  if (!value) return "—";
  return value.toLocaleString("fr-FR") + " km";
}

function getGuestFavorites(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("favorites");
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function clearGuestFavorites() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("favorites");
}

export default function CompteFavorisPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [items, setItems] = useState<FavoriteListing[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const favoriteCount = useMemo(() => items.length, [items]);

  useEffect(() => {
    let mounted = true;

    async function mergeGuestFavoritesToAccount(userId: string) {
      const guestIds = getGuestFavorites();

      if (guestIds.length === 0) {
        return;
      }

      const uniqueGuestIds = [...new Set(guestIds)];

      const { data: existingFavorites, error: existingError } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", userId)
        .in("listing_id", uniqueGuestIds);

      if (existingError) {
        throw new Error("Impossible de vérifier les favoris existants.");
      }

      const existingIds = new Set(
        (existingFavorites ?? []).map((fav) => fav.listing_id)
      );

      const missingIds = uniqueGuestIds.filter((id) => !existingIds.has(id));

      if (missingIds.length > 0) {
        const rowsToInsert = missingIds.map((listingId) => ({
          user_id: userId,
          listing_id: listingId,
        }));

        const { error: insertError } = await supabase
          .from("favorites")
          .insert(rowsToInsert);

        if (insertError) {
          throw new Error("Impossible de transférer les favoris du visiteur.");
        }
      }

      clearGuestFavorites();
    }

    async function loadFavorites() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        const user = session?.user ?? null;

        if (user) {
          if (!mounted) return;
          setIsAuthenticated(true);

          await mergeGuestFavoritesToAccount(user.id);

          const { data: favorites, error } = await supabase
            .from("favorites")
            .select(
              `
              id,
              created_at,
              listings (
                id,
                title,
                brand,
                model,
                year,
                mileage,
                price,
                city,
                department,
                fuel,
                type,
                photos,
                description
              )
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) {
            throw new Error("Impossible de charger les favoris.");
          }

          const mappedItems =
            favorites
              ?.map((fav: any) => {
                const listing = Array.isArray(fav.listings)
                  ? fav.listings[0]
                  : fav.listings;

                return listing ?? null;
              })
              .filter(Boolean) ?? [];

          if (!mounted) return;
          setItems(mappedItems as FavoriteListing[]);
          setLoading(false);
          return;
        }

        if (!mounted) return;
        setIsAuthenticated(false);

        const guestIds = getGuestFavorites();

        if (guestIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }

        const { data: listings, error } = await supabase
          .from("listings")
          .select(
            `
            id,
            title,
            brand,
            model,
            year,
            mileage,
            price,
            city,
            department,
            fuel,
            type,
            photos,
            description
          `
          )
          .in("id", guestIds);

        if (error) {
          throw new Error("Impossible de charger les favoris temporaires.");
        }

        const orderedListings =
          guestIds
            .map((id) => listings?.find((listing) => listing.id === id))
            .filter(Boolean) ?? [];

        if (!mounted) return;
        setItems(orderedListings as FavoriteListing[]);
      } catch (error: any) {
        if (!mounted) return;
        setErrorMessage(
          error?.message || "Impossible de charger les favoris."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      mounted = false;
    };
  }, [supabase]);

  return (
    <div className="mx-auto max-w-6xl bg-white text-slate-900">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {isAuthenticated ? (
          <>
            <Link
              href="/compte"
              className="font-medium text-slate-700 hover:text-orange-600 hover:underline"
            >
              Mon compte
            </Link>
            <span>›</span>
          </>
        ) : null}

        <span>Favoris</span>
      </div>

      <section className="mt-5 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              {isAuthenticated ? "Compte particulier" : "Visiteur"}
            </p>

            <h1 className="mt-1 text-[26px] font-semibold text-slate-900 sm:text-[30px]">
              Mes favoris
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              {isAuthenticated
                ? "Retrouvez les annonces que vous avez enregistrées."
                : "Retrouvez les annonces enregistrées sur cet appareil."}
            </p>
          </div>

          <Link
            href="/annonces"
            className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="pt-6">
          <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  Sauvegardez vos favoris sur tous vos appareils
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Créez un compte gratuit pour conserver vos annonces favorites,
                  les retrouver plus tard et ne rien perdre.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/inscription"
                  className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600"
                >
                  Créer un compte
                </Link>

                <Link
                  href="/connexion"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                >
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="py-8">
        {loading ? (
          <div className="border border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-sm text-slate-600">Chargement des favoris...</p>
          </div>
        ) : errorMessage ? (
          <div className="border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : favoriteCount === 0 ? (
          <div className="border border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-6 w-6 text-slate-700" />
            </div>

            <h2 className="mt-5 text-[22px] font-semibold text-slate-900">
              Aucun favori pour le moment
            </h2>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ajoutez des annonces à vos favoris pour les retrouver rapidement ici.
            </p>

            <div className="mt-6">
              <Link
                href="/annonces"
                className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Parcourir les annonces
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const photo =
                Array.isArray(item.photos) && item.photos.length > 0
                  ? item.photos[0]
                  : "";

              const locationText =
                item.city && item.department
                  ? `${item.city} (${item.department})`
                  : item.city || item.department || "Localisation non renseignée";

              return (
                <Link
                  key={item.id}
                  href={`/annonces/${item.id}`}
                  className="group overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
                >
                  <div className="overflow-hidden border-b border-slate-200 bg-slate-100">
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.title ?? "Annonce"}
                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500">
                        Photo indisponible
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-lg font-semibold text-slate-900">
                          {item.title ?? "Annonce véhicule"}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {locationText}
                        </p>
                      </div>

                      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-600">
                        Favori
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                      <span>{item.year || "—"}</span>
                      <span>{formatKm(item.mileage)}</span>
                      <span>{item.fuel || "—"}</span>
                      <span>{item.type || "—"}</span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-xl font-bold text-orange-600">
                        {formatPrice(item.price)}
                      </p>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600">
                        Voir l’annonce
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}