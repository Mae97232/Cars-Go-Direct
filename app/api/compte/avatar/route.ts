import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non connecté", step: "auth" },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier envoyé", step: "file" },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop() || "jpg";
    const filePath = `${user.id}/avatar.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json(
        {
          error: uploadError.message,
          step: "storage_upload",
        },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const avatarUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;

    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select("*")
      .maybeSingle();

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
          step: "profile_update",
        },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          email: user.email ?? null,
          role: "buyer",
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (insertError) {
        return NextResponse.json(
          {
            error: insertError.message,
            step: "profile_insert",
          },
          { status: 500 }
        );
      }

      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          avatar_url: avatarUrl,
        },
      });

      if (metadataError) {
        return NextResponse.json(
          {
            error: metadataError.message,
            step: "metadata_update_after_insert",
          },
          { status: 500 }
        );
      }

      revalidatePath("/compte");
      revalidatePath("/compte/parametres");

      return NextResponse.json({
        success: true,
        avatarUrl,
      });
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        avatar_url: avatarUrl,
      },
    });

    if (metadataError) {
      return NextResponse.json(
        {
          error: metadataError.message,
          step: "metadata_update",
        },
        { status: 500 }
      );
    }

    revalidatePath("/compte");
    revalidatePath("/compte/parametres");

    return NextResponse.json({
      success: true,
      avatarUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erreur serveur avatar",
        step: "catch",
      },
      { status: 500 }
    );
  }
}