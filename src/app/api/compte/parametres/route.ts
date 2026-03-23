import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function normalizeDate(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return date.toISOString().slice(0, 10);
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PUT(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const body = await req.json();
  const now = new Date().toISOString();

  const normalizedPhone = "phone" in body ? normalizeText(body.phone) : undefined;
  const normalizedCity = "city" in body ? normalizeText(body.city) : undefined;
  const normalizedIban = "iban" in body ? normalizeText(body.iban) : undefined;

  const profileUpdates: Record<string, unknown> = {
    updated_at: now,
  };

  if ("firstName" in body) profileUpdates.first_name = normalizeText(body.firstName);
  if ("lastName" in body) profileUpdates.last_name = normalizeText(body.lastName);
  if ("phone" in body) profileUpdates.phone = normalizedPhone;
  if ("city" in body) profileUpdates.city = normalizedCity;
  if ("address" in body) profileUpdates.address = normalizeText(body.address);
  if ("birthdate" in body) profileUpdates.birthdate = normalizeDate(body.birthdate);
  if ("gender" in body) profileUpdates.gender = normalizeText(body.gender) || "unspecified";
  if ("iban" in body) profileUpdates.iban = normalizedIban;
  if ("notificationsMessages" in body) {
    profileUpdates.notifications_messages = Boolean(body.notificationsMessages);
  }
  if ("notificationsEmails" in body) {
    profileUpdates.notifications_emails = Boolean(body.notificationsEmails);
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from("profiles")
    .update(profileUpdates)
    .eq("id", user.id)
    .select("*")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json(
      { error: `Impossible de mettre à jour le profil : ${updateError.message}` },
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
        ...profileUpdates,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Impossible de créer le profil : ${insertError.message}` },
        { status: 500 }
      );
    }

    const { error: metadataError } = await supabase.auth.updateUser({
      data: {
        city: insertedProfile.city ?? null,
        phone: insertedProfile.phone ?? null,
      },
    });

    if (metadataError) {
      return NextResponse.json(
        { error: `Profil créé mais metadata non mise à jour : ${metadataError.message}` },
        { status: 500 }
      );
    }

    revalidatePath("/compte");
    revalidatePath("/compte/parametres");

    return NextResponse.json({
      success: true,
      profile: insertedProfile,
    });
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      city: normalizedCity ?? updatedProfile.city ?? null,
      phone: normalizedPhone ?? updatedProfile.phone ?? null,
    },
  });

  if (metadataError) {
    return NextResponse.json(
      { error: `Profil mis à jour mais metadata non mise à jour : ${metadataError.message}` },
      { status: 500 }
    );
  }

  revalidatePath("/compte");
  revalidatePath("/compte/parametres");

  return NextResponse.json({
    success: true,
    profile: updatedProfile,
  });
}