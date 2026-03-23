import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";

type ProAccountRow = {
  id: string;
};

type ListingRow = {
  id: string;
};

export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          reason: "Non authentifié.",
        },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { data: proAccount, error: proAccountError } = await supabaseAdmin
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", userId)
      .maybeSingle<ProAccountRow>();

    if (proAccountError) {
      console.error("ACCOUNT_DELETE_PRO_ACCOUNT_FETCH_ERROR", proAccountError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de récupérer le compte professionnel.",
        },
        { status: 500 }
      );
    }

    const proId = proAccount?.id ?? null;

    const { error: favoritesError } = await supabaseAdmin
      .from("favorites")
      .delete()
      .eq("profile_id", userId);

    if (favoritesError) {
      console.error("ACCOUNT_DELETE_FAVORITES_ERROR", favoritesError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer les favoris.",
        },
        { status: 500 }
      );
    }

    const { error: messagesError } = await supabaseAdmin
      .from("messages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (messagesError) {
      console.error("ACCOUNT_DELETE_MESSAGES_ERROR", messagesError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer les messages.",
        },
        { status: 500 }
      );
    }

    const { error: conversationsError } = await supabaseAdmin
      .from("conversations")
      .delete()
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (conversationsError) {
      console.error("ACCOUNT_DELETE_CONVERSATIONS_ERROR", conversationsError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer les conversations.",
        },
        { status: 500 }
      );
    }

    if (proId) {
      const { data: listings, error: listingsFetchError } = await supabaseAdmin
        .from("listings")
        .select("id")
        .eq("pro_account_id", proId)
        .returns<ListingRow[]>();

      if (listingsFetchError) {
        console.error("ACCOUNT_DELETE_LISTINGS_FETCH_ERROR", listingsFetchError);

        return NextResponse.json(
          {
            success: false,
            reason: "Impossible de récupérer les annonces du compte pro.",
          },
          { status: 500 }
        );
      }

      const listingIds = (listings ?? []).map((item) => item.id);

      if (listingIds.length > 0) {
        const { error: listingPhotosError } = await supabaseAdmin
          .from("listing_photos")
          .delete()
          .in("listing_id", listingIds);

        if (listingPhotosError) {
          console.error("ACCOUNT_DELETE_LISTING_PHOTOS_ERROR", listingPhotosError);

          return NextResponse.json(
            {
              success: false,
              reason: "Impossible de supprimer les photos des annonces.",
            },
            { status: 500 }
          );
        }

        const { error: listingsDeleteError } = await supabaseAdmin
          .from("listings")
          .delete()
          .eq("pro_account_id", proId);

        if (listingsDeleteError) {
          console.error("ACCOUNT_DELETE_LISTINGS_ERROR", listingsDeleteError);

          return NextResponse.json(
            {
              success: false,
              reason: "Impossible de supprimer les annonces.",
            },
            { status: 500 }
          );
        }
      }

      const { error: proDeleteError } = await supabaseAdmin
        .from("pro_accounts")
        .delete()
        .eq("id", proId);

      if (proDeleteError) {
        console.error("ACCOUNT_DELETE_PRO_ACCOUNT_ERROR", proDeleteError);

        return NextResponse.json(
          {
            success: false,
            reason: "Impossible de supprimer le compte professionnel.",
          },
          { status: 500 }
        );
      }
    }

    const { error: privateSettingsError } = await supabaseAdmin
      .from("private_user_settings")
      .delete()
      .eq("profile_id", userId);

    if (privateSettingsError) {
      console.error("ACCOUNT_DELETE_PRIVATE_SETTINGS_ERROR", privateSettingsError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer les paramètres privés.",
        },
        { status: 500 }
      );
    }

    const { error: profileDeleteError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileDeleteError) {
      console.error("ACCOUNT_DELETE_PROFILE_ERROR", profileDeleteError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer le profil.",
        },
        { status: 500 }
      );
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authDeleteError) {
      console.error("ACCOUNT_DELETE_AUTH_ERROR", authDeleteError);

      return NextResponse.json(
        {
          success: false,
          reason: "Impossible de supprimer le compte utilisateur.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reason: "Votre compte a été supprimé définitivement.",
    });
  } catch (error) {
    console.error("ACCOUNT_DELETE_FULL_ERROR", error);

    return NextResponse.json(
      {
        success: false,
        reason: "Erreur serveur lors de la suppression du compte.",
      },
      { status: 500 }
    );
  }
}