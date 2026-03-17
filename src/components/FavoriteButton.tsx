"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Props = {
  listingId: string;
  initialIsFavorite?: boolean;
};

export default function FavoriteButton({
  listingId,
  initialIsFavorite = false,
}: Props) {
  const supabase = createClient();
  const router = useRouter();

  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  async function toggleFavorite() {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/connexion");
        return;
      }

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
        router.refresh();
        return;
      }

      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        listing_id: listingId,
      });

      if (error) {
        setErrorMessage("Impossible d’ajouter cette annonce aux favoris.");
        return;
      }

      setIsFavorite(true);
      router.refresh();
    } catch {
      setErrorMessage("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={toggleFavorite}
        disabled={loading}
        className={
          isFavorite
            ? "inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            : "inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        }
        aria-pressed={isFavorite}
        aria-label={
          isFavorite ? "Retirer cette annonce des favoris" : "Ajouter cette annonce aux favoris"
        }
      >
        <Heart
          className={`h-4 w-4 shrink-0 ${isFavorite ? "fill-current" : ""}`}
        />
        <span className="truncate">
          {loading
            ? "Chargement..."
            : isFavorite
            ? "Retirer des favoris"
            : "Ajouter aux favoris"}
        </span>
      </button>

      {errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:text-[13px]">
          {errorMessage}
        </div>
      ) : null}
    </div>
  );
}