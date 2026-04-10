import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdsForAdmin() {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("ads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}