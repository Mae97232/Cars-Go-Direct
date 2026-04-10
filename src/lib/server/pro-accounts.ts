import { createAdminClient } from "@/lib/supabase/admin";

export async function getProAccounts() {
  const supabaseAdmin = createAdminClient();

  const [prosResult, authUsersResult] = await Promise.all([
    supabaseAdmin
      .from("pro_accounts")
      .select(`
        id,
        profile_id,
        garage_name,
        siret,
        city,
        verification_status,
        created_at
      `)
      .order("created_at", { ascending: false }),
    supabaseAdmin.auth.admin.listUsers(),
  ]);

  if (prosResult.error) {
    console.error("Erreur récupération comptes pros:", prosResult.error);
    throw new Error(prosResult.error.message);
  }

  if (authUsersResult.error) {
    console.error("Erreur récupération utilisateurs auth pour pros:", authUsersResult.error);
    throw new Error(authUsersResult.error.message);
  }

  const authUsersById = new Map(
    (authUsersResult.data.users ?? []).map((user) => [user.id, user])
  );

  return (prosResult.data ?? []).map((pro) => {
    const authUser = authUsersById.get(pro.profile_id);

    return {
      ...pro,
      profiles: {
        email: authUser?.email ?? null,
      },
    };
  });
}