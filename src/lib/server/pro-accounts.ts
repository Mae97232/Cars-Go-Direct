import { createClient } from "@/lib/supabase/server";

export async function getProAccounts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("pro_accounts")
    .select(`
      id,
      garage_name,
      siret,
      city,
      verification_status,
      created_at,
      profiles (
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}