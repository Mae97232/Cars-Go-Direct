import { createClient } from "@/lib/supabase/server";

export async function getListingById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      pro_account_id,
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
      description,
      photos,
      status,
      created_at,
      transmission,
      doors,
      seats,
      color,
      power_din,
      fiscal_power,
      first_registration,
      maintenance_book,
      vehicle_history,
      parts_availability,
      equipment,
      highlights,
      pro_accounts (
        id,
        garage_name,
        city,
        siret,
        phone,
        verification_status,
        profile_id
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("getListingById error:", error);
    return null;
  }

  return data;
}