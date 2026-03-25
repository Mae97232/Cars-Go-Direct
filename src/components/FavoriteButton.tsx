"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  listingId: string;
  initialIsFavorite?: boolean;
};

function getGuestFavorites(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem("favorites") || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setGuestFavorites(ids: string[]) {
  localStorage.setItem("favorites", JSON.stringify(ids));
}

export default function FavoriteButton({
  listingId,
  initialIsFavorite = false,
}: Props) {
  const supabase = createClient();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initFavoriteState() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        const user = session?.user ?? null;

        if (user) {
          setIsAuthenticated(true);
          setIsFavorite(initialIsFavorite);
        } else {
          setIsAuthenticated(false);
          const guestFavorites = getGuestFavorites();
          setIsFavorite(guestFavorites.includes(listingId));
        }
      } catch {
        if (!mounted) return;
        setIsAuthenticated(false);
        const guestFavorites = getGuestFavorites();
        setIsFavorite(guestFavorites.includes(listingId));
      }
    }

    initFavoriteState();

    return () => {
      mounted = false;
    };
  }, [initialIsFavorite, listingId, supabase]);

  async function toggleFavorite() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user ?? null;

      if (!user) {
        const guestFavorites = getGuestFavorites();

        if (guestFavorites.includes(listingId)) {
          const next = guestFavorites.filter((id) => id !== listingId);
          setGuestFavorites(next);
          setIsFavorite(false);
          setInfoMessage("Retiré des favoris sur cet appareil.");
        } else {
          const next = [...new Set([...guestFavorites, listingId])];
          setGuestFavorites(next);
          setIsFavorite(true);
          setInfoMessage("Ajouté en favori sur cet appareil.");
        }

        setIsAuthenticated(false);
        return;
      }

      setIsAuthenticated(true);

      if (isFavorite) {
        const { error } = await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("listing_id", listingId);

        if (error) {
          setErrorMessage("Impossible de retirer ce favori.");
          return;
        }

        setIsFavorite(false);
        setInfoMessage("Annonce retirée de vos favoris.");
        return;
      }

      const { error } = await supabase.from("favorites").upsert(
        {
          user_id: user.id,
          listing_id: listingId,
        },
        {
          onConflict: "user_id,listing_id",
        }
      );

      if (error) {
        setErrorMessage("Impossible d’ajouter cette annonce aux favoris.");
        return;
      }

      setIsFavorite(true);
      setInfoMessage("Annonce ajoutée à vos favoris.");
    } catch {
      try {
        const guestFavorites = getGuestFavorites();

        if (guestFavorites.includes(listingId)) {
          const next = guestFavorites.filter((id) => id !== listingId);
          setGuestFavorites(next);
          setIsFavorite(false);
          setInfoMessage("Retiré des favoris sur cet appareil.");
        } else {
          const next = [...new Set([...guestFavorites, listingId])];
          setGuestFavorites(next);
          setIsFavorite(true);
          setInfoMessage("Ajouté en favori sur cet appareil.");
        }

        setIsAuthenticated(false);
      } catch {
        setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex max-w-full flex-col items-start gap-2">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        className={
          isFavorite
            ? "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-600 transition hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            : "inline-flex min-h-[46px] items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        }
        aria-pressed={isFavorite}
        aria-label={
          isFavorite
            ? "Retirer cette annonce des favoris"
            : "Ajouter cette annonce aux favoris"
        }
      >
        <Heart
          className={`h-4 w-4 shrink-0 ${isFavorite ? "fill-current" : ""}`}
        />
        <span className="whitespace-nowrap">
          {loading
            ? "Chargement..."
            : isFavorite
            ? "Retirer des favoris"
            : "Ajouter aux favoris"}
        </span>
      </button>

      {!loading && isAuthenticated === false && !infoMessage ? (
        <p className="max-w-[320px] text-xs leading-5 text-slate-500 sm:text-[13px]">
          Enregistré temporairement sur cet appareil.
        </p>
      ) : null}

      {infoMessage ? (
        <div className="max-w-[320px] rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-xs leading-5 text-orange-700 sm:text-[13px]">
          {infoMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="max-w-[320px] rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs leading-5 text-red-700 sm:text-[13px]">
          {errorMessage}
        </div>
      ) : null}

      {isAuthenticated === false && isFavorite ? (
        <div className="max-w-[320px] text-xs leading-5 text-slate-500 sm:text-[13px]">
          Créez un compte pour retrouver ce favori partout.
        </div>
      ) : null}
    </div>
  );
}