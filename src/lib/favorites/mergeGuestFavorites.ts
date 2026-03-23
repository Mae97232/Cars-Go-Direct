import { createClient } from "@/lib/supabase/client";

function getGuestFavorites(): string[] {
  if (typeof window === "undefined") return [];

  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

function clearGuestFavorites() {
  localStorage.removeItem("favorites");
}

export async function mergeGuestFavoritesToAccount(userId: string) {
  const supabase = createClient();
  const guestFavorites = getGuestFavorites();

  if (!guestFavorites.length) return;

  const rows = guestFavorites.map((listingId) => ({
    user_id: userId,
    listing_id: listingId,
  }));

  const { error } = await supabase
    .from("favorites")
    .upsert(rows, { onConflict: "user_id,listing_id" });

  if (!error) {
    clearGuestFavorites();
  }

  return { error };
}