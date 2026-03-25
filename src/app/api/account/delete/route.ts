import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProAccountRow = {
  id: string;
};

type ListingRow = {
  id: string;
};

function errorResponse(reason: string, status = 500) {
  return NextResponse.json(
    {
      success: false,
      reason,
    },
    { status }
  );
}

export async function POST() {
  try {
    const supabase = await createClient();
    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return errorResponse("Non authentifié.", 401);
    }

    const userId = user.id;

    const { data: proAccount, error: proAccountError } = await supabaseAdmin
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle();

    if (proAccountError) {
      console.error("ACCOUNT_DELETE_PRO_ACCOUNT_FETCH_ERROR", proAccountError);
      return errorResponse("Impossible de récupérer le compte professionnel.");
    }

    const typedProAccount = proAccount as ProAccountRow | null;
    const proId = typedProAccount?.id ?? null;

    const { error: favoritesError } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("user_id", userId);

    if (favoritesError) {
      console.error("ACCOUNT_DELETE_FAVORITES_ERROR", favoritesError);
      return errorResponse("Impossible de supprimer les favoris.");
    }

    const { error: buyerConversationsError } = await supabaseAdmin
      .from("conversations")
      .delete()
      .eq("buyer_profile_id", userId);

    if (buyerConversationsError) {
      console.error(
        "ACCOUNT_DELETE_BUYER_CONVERSATIONS_ERROR",
        buyerConversationsError
      );
      return errorResponse("Impossible de supprimer les conversations acheteur.");
    }

    if (proId) {
      const { error: proConversationsError } = await supabaseAdmin
        .from("conversations")
        .delete()
        .eq("garage_id", proId);

      if (proConversationsError) {
        console.error(
          "ACCOUNT_DELETE_PRO_CONVERSATIONS_ERROR",
          proConversationsError
        );
        return errorResponse("Impossible de supprimer les conversations du garage.");
      }

      const { data: listings, error: listingsFetchError } = await supabaseAdmin
        .from("listings")
        .select("id")
        .eq("pro_account_id", proId);

      if (listingsFetchError) {
        console.error("ACCOUNT_DELETE_LISTINGS_FETCH_ERROR", listingsFetchError);
        return errorResponse("Impossible de récupérer les annonces du compte pro.");
      }

      const listingIds = ((listings ?? []) as ListingRow[]).map((item) => item.id);

      if (listingIds.length > 0) {
        const { error: listingPhotosError } = await supabaseAdmin
          .from("listing_photos")
          .delete()
          .in("listing_id", listingIds);

        if (listingPhotosError) {
          console.error(
            "ACCOUNT_DELETE_LISTING_PHOTOS_ERROR",
            listingPhotosError
          );
          return errorResponse("Impossible de supprimer les photos des annonces.");
        }

        const { error: listingsDeleteError } = await supabaseAdmin
          .from("listings")
          .delete()
          .eq("pro_account_id", proId);

        if (listingsDeleteError) {
          console.error("ACCOUNT_DELETE_LISTINGS_ERROR", listingsDeleteError);
          return errorResponse("Impossible de supprimer les annonces.");
        }
      }

      const { error: proDeleteError } = await supabaseAdmin
        .from("pro_accounts")
        .delete()
        .eq("id", proId);

      if (proDeleteError) {
        console.error("ACCOUNT_DELETE_PRO_ACCOUNT_ERROR", proDeleteError);
        return errorResponse("Impossible de supprimer le compte professionnel.");
      }
    }

    const { error: privateSettingsError } = await supabaseAdmin
      .from("private_user_settings")
      .delete()
      .eq("profile_id", userId);

    if (privateSettingsError) {
      console.error(
        "ACCOUNT_DELETE_PRIVATE_SETTINGS_ERROR",
        privateSettingsError
      );
      return errorResponse("Impossible de supprimer les paramètres privés.");
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("ACCOUNT_DELETE_PROFILE_ERROR", profileDeleteError);
      return errorResponse("Impossible de supprimer le profil.");
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("ACCOUNT_DELETE_AUTH_ERROR", authDeleteError);
      return errorResponse("Impossible de supprimer le compte utilisateur.");
    }

    return NextResponse.json({
      success: true,
      reason: "Votre compte a été supprimé définitivement.",
    });
  } catch (error) {
    console.error("ACCOUNT_DELETE_FULL_ERROR", error);

    return errorResponse("Erreur serveur lors de la suppression du compte.");
  }
}