import { createClient } from "@/lib/supabase/server";
import type { RawListing } from "@/app/annonces/annoncesclient";

export async function getPublishedListings(): Promise<RawListing[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      title,
      brand,
      model,
      year,
      mileage,
      price,
      city,
      department,
      type,
      fuel,
      vat_recoverable,
      photos,
      description,
      created_at
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les annonces : ${error.message}`);
  }

  return (data ?? []) as RawListing[];
}