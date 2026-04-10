"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guard";
import { createAdminClient } from "@/lib/supabase/admin";

async function logAdminAction(params: {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, unknown>;
}) {
  const supabaseAdmin = createAdminClient();

  await supabaseAdmin.from("admin_logs").insert({
    admin_user_id: params.adminUserId,
    action: params.action,
    target_type: params.targetType,
    target_id: params.targetId ?? null,
    details: params.details ?? {},
  });
}

export async function suspendUser(userId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_suspended: true })
    .eq("id", userId);

  if (error) {
    throw new Error("Impossible de suspendre ce compte.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "suspend_user",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin");
}

export async function reactivateUser(userId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_suspended: false })
    .eq("id", userId);

  if (error) {
    throw new Error("Impossible de réactiver ce compte.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "reactivate_user",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin");
}

export async function softDeleteUser(userId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId, true);

  if (authError) {
    throw new Error("Impossible de supprimer ce compte côté Auth.");
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      deleted_at: new Date().toISOString(),
      is_suspended: true,
    })
    .eq("id", userId);

  if (profileError) {
    throw new Error("Compte Auth supprimé, mais profil non mis à jour.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "soft_delete_user",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin");
}

export async function promoteToAdmin(userId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_admin: true })
    .eq("id", userId);

  if (error) {
    throw new Error("Impossible de promouvoir cet utilisateur.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "promote_admin",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin");
}

export async function removeAdminRights(userId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  if (profile.id === userId) {
    throw new Error("Vous ne pouvez pas retirer vos propres droits admin.");
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_admin: false })
    .eq("id", userId);

  if (error) {
    throw new Error("Impossible de retirer les droits admin.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "remove_admin",
    targetType: "user",
    targetId: userId,
  });

  revalidatePath("/admin");
}

export async function setAdStatus(adId: string, status: "draft" | "active" | "paused" | "archived") {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("ads")
    .update({ status })
    .eq("id", adId);

  if (error) {
    throw new Error("Impossible de modifier cette publicité.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "set_ad_status",
    targetType: "ad",
    targetId: adId,
    details: { status },
  });

  revalidatePath("/admin");
}

export async function deleteAd(adId: string) {
  const { profile } = await requireAdmin();
  const supabaseAdmin = createAdminClient();

  const { error } = await supabaseAdmin
    .from("ads")
    .delete()
    .eq("id", adId);

  if (error) {
    throw new Error("Impossible de supprimer cette publicité.");
  }

  await logAdminAction({
    adminUserId: profile.id,
    action: "delete_ad",
    targetType: "ad",
    targetId: adId,
  });

  revalidatePath("/admin");
}