import { createClient } from "@/lib/supabase/server";

export async function getListings() {
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
      status,
      views,
      contacts,
      created_at,
      pro_accounts (
        id,
        garage_name
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erreur récupération annonces:", error);
    throw new Error(error.message);
  }

  return data ?? [];
}