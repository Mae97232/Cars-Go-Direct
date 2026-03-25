import { createClient } from "@/lib/supabase/server";
import type { RawListing } from "@/app/annonces/annoncesclient";

type ListingRow = {
  id: string;
  title: string;
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
  created_at: string;
  pro_accounts:
    | {
        garage_name: string | null;
        google_rating: number | null;
        google_reviews_count: number | null;
        google_maps_url: string | null;
      }
    | {
        garage_name: string | null;
        google_rating: number | null;
        google_reviews_count: number | null;
        google_maps_url: string | null;
      }[]
    | null;
};

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
      created_at,
      pro_accounts (
        garage_name,
        google_rating,
        google_reviews_count,
        google_maps_url
      )
    `)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Impossible de charger les annonces : ${error.message}`);
  }

  const rows = (data ?? []) as ListingRow[];

  return rows.map((listing) => {
    const pro =
      Array.isArray(listing.pro_accounts)
        ? listing.pro_accounts[0] ?? null
        : listing.pro_accounts;

    return {
      id: listing.id,
      title: listing.title,
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      mileage: listing.mileage,
      price: listing.price,
      city: listing.city,
      department: listing.department,
      type: listing.type,
      fuel: listing.fuel,
      vat_recoverable: listing.vat_recoverable,
      photos: listing.photos,
      description: listing.description,
      created_at: listing.created_at,

      garage_name: pro?.garage_name ?? null,
      google_rating: pro?.google_rating ?? null,
      google_reviews_count: pro?.google_reviews_count ?? null,
      google_maps_url: pro?.google_maps_url ?? null,
    } as RawListing;
  });
}