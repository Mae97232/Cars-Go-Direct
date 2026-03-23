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
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
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

    async function loadFavorites() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw new Error("Impossible de vérifier la session utilisateur.");
        }

        if (user) {
          if (!mounted) return;
          setIsAuthenticated(true);

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

                return listing ? listing : null;
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
    <div className="mx-auto max-w-6xl">
      <div className="animate-fade-up flex flex-wrap items-center gap-2 text-sm text-slate-500">
        {isAuthenticated ? (
          <>
            <Link
              href="/compte"
              className="text-3d-soft font-medium text-[#171311] hover:underline"
            >
              Mon compte
            </Link>
            <span>›</span>
          </>
        ) : null}

        <span className="text-3d-soft">Favoris</span>
      </div>

      <section className="mt-5 border-b border-[#ece7e0] pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <p className="text-3d-soft text-sm text-slate-500">
              {isAuthenticated ? "Compte particulier" : "Visiteur"}
            </p>

            <h1 className="text-3d-hero mt-1 text-3xl font-bold tracking-tight text-black">
              Mes favoris
            </h1>

            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              {isAuthenticated
                ? "Retrouvez les annonces que vous avez enregistrées."
                : "Retrouvez les annonces enregistrées sur cet appareil."}
            </p>
          </div>

          <Link
            href="/annonces"
            className="text-3d-soft animate-fade-up inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
            style={{ animationDelay: "0.12s" }}
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      {!isAuthenticated ? (
        <section className="pt-6">
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-[#faf7f2] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-3d-title text-lg font-semibold text-black">
                  Sauvegardez vos favoris sur tous vos appareils
                </p>
                <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
                  Créez un compte gratuit pour conserver vos annonces favorites,
                  les retrouver plus tard et ne rien perdre.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/inscription"
                  className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c]"
                >
                  Créer un compte
                </Link>

                <Link
                  href="/connexion"
                  className="text-3d-soft inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-5 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
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
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <p className="text-3d-soft text-sm text-slate-600">
              Chargement des favoris...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="animate-fade-up rounded-[28px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : favoriteCount === 0 ? (
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f3ef]">
              <Heart className="h-6 w-6 text-[#171311]" />
            </div>

            <h2 className="text-3d-title mt-5 text-xl font-semibold text-black">
              Aucun favori pour le moment
            </h2>

            <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
              Ajoutez des annonces à vos favoris pour les retrouver rapidement ici.
            </p>

            <div className="mt-6">
              <Link
                href="/annonces"
                className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c]"
              >
                Parcourir les annonces
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, index) => {
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
                  className="animate-fade-up group overflow-hidden rounded-[28px] border border-[#e7e2db] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d4ccc2] hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
                  style={{ animationDelay: `${0.06 + index * 0.04}s` }}
                >
                  <div className="overflow-hidden bg-slate-100">
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.title ?? "Annonce"}
                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="text-3d-soft grid aspect-[4/3] place-items-center text-sm text-slate-500">
                        Photo indisponible
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-3d-title line-clamp-2 text-lg font-semibold text-black">
                          {item.title ?? "Annonce véhicule"}
                        </p>
                        <p className="text-3d-soft mt-2 text-sm text-slate-500">
                          {locationText}
                        </p>
                      </div>

                      <span className="text-3d-soft inline-flex rounded-full border border-[#f0d8dd] bg-[#fff5f6] px-3 py-1 text-xs font-semibold text-[#8b3a47]">
                        Favori
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.year || "—"}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {formatKm(item.mileage)}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.fuel || "—"}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.type || "—"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-3d-title text-xl font-semibold tracking-tight text-black">
                        {formatPrice(item.price)}
                      </p>
                      <span className="text-3d-title text-sm font-medium text-[#171311]">
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