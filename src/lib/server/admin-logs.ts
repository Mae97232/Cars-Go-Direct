import { createAdminClient } from "@/lib/supabase/admin";

export async function getAdminLogs() {
  const supabaseAdmin = createAdminClient();

  const { data, error } = await supabaseAdmin
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}