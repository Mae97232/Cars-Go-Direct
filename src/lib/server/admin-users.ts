import { createAdminClient } from "@/lib/supabase/admin";

export async function getAllUsersForAdmin() {
  const supabaseAdmin = createAdminClient();

  const [authUsersResult, profilesResult, proAccountsResult] = await Promise.all([
    supabaseAdmin.auth.admin.listUsers(),
    supabaseAdmin
      .from("profiles")
      .select("id, email, role, is_admin, is_suspended, deleted_at, created_at"),
    supabaseAdmin
      .from("pro_accounts")
      .select("id, profile_id, garage_name, verification_status"),
  ]);

  if (authUsersResult.error) {
    throw authUsersResult.error;
  }

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (proAccountsResult.error) {
    throw proAccountsResult.error;
  }

  const prosByProfileId = new Map(
    (proAccountsResult.data ?? []).map((pro) => [pro.profile_id, pro])
  );

  return (profilesResult.data ?? []).map((profile) => {
    const authUser = authUsersResult.data.users.find((u) => u.id === profile.id);
    const pro = prosByProfileId.get(profile.id);

    const isPro = profile.role === "pro";

    return {
      id: profile.id,
      email: profile.email ?? authUser?.email ?? "—",
      created_at: profile.created_at ?? authUser?.created_at ?? null,
      is_admin: profile.is_admin ?? false,
      is_suspended: profile.is_suspended ?? false,
      deleted_at: profile.deleted_at ?? null,
      role: profile.role ?? null,
      kind: isPro ? "Professionnel" : "Particulier",
      garage_name: pro?.garage_name ?? null,
      verification_status: pro?.verification_status ?? null,
    };
  });
}