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

  const normalizedFirstName =
    "firstName" in body ? normalizeText(body.firstName) : undefined;
  const normalizedLastName =
    "lastName" in body ? normalizeText(body.lastName) : undefined;
  const normalizedPhone =
    "phone" in body ? normalizeText(body.phone) : undefined;
  const normalizedCity =
    "city" in body ? normalizeText(body.city) : undefined;
  const normalizedAddress =
    "address" in body ? normalizeText(body.address) : undefined;
  const normalizedGender =
    "gender" in body
      ? normalizeText(body.gender) || "unspecified"
      : undefined;
  const normalizedBirthdate =
    "birthdate" in body ? normalizeDate(body.birthdate) : undefined;
  const normalizedIban =
    "iban" in body ? normalizeText(body.iban) : undefined;

  const { data: existingProfile, error: existingProfileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfileError) {
    return NextResponse.json(
      {
        error: `Impossible de récupérer le profil actuel : ${existingProfileError.message}`,
      },
      { status: 500 }
    );
  }

  const profileUpdates: Record<string, unknown> = {
    updated_at: now,
  };

  if ("firstName" in body) profileUpdates.first_name = normalizedFirstName;
  if ("lastName" in body) profileUpdates.last_name = normalizedLastName;
  if ("phone" in body) profileUpdates.phone = normalizedPhone;
  if ("city" in body) profileUpdates.city = normalizedCity;
  if ("address" in body) profileUpdates.address = normalizedAddress;
  if ("gender" in body) profileUpdates.gender = normalizedGender;

  if ("iban" in body) profileUpdates.iban = normalizedIban;

  if ("notificationsMessages" in body) {
    profileUpdates.notifications_messages = Boolean(body.notificationsMessages);
  }

  if ("notificationsEmails" in body) {
    profileUpdates.notifications_emails = Boolean(body.notificationsEmails);
  }

  if ("birthdate" in body) {
    const alreadyHasBirthdate = Boolean(existingProfile?.birthdate);

    if (!alreadyHasBirthdate && normalizedBirthdate) {
      profileUpdates.birthdate = normalizedBirthdate;
    }
  }

  let finalProfile: Record<string, unknown> | null = null;

  if (existingProfile) {
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", user.id)
      .select("*")
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: `Impossible de mettre à jour le profil : ${updateError.message}` },
        { status: 500 }
      );
    }

    finalProfile = updatedProfile;
  } else {
    const { data: insertedProfile, error: insertError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email ?? null,
        role: "buyer",
        first_name: normalizedFirstName ?? "",
        last_name: normalizedLastName ?? "",
        phone: normalizedPhone ?? "",
        city: normalizedCity ?? "",
        address: normalizedAddress ?? "",
        gender: normalizedGender ?? "unspecified",
        birthdate: normalizedBirthdate ?? null,
        iban: normalizedIban ?? "",
        notifications_messages:
          "notificationsMessages" in body
            ? Boolean(body.notificationsMessages)
            : false,
        notifications_emails:
          "notificationsEmails" in body
            ? Boolean(body.notificationsEmails)
            : false,
        updated_at: now,
      })
      .select("*")
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: `Impossible de créer le profil : ${insertError.message}` },
        { status: 500 }
      );
    }

    finalProfile = insertedProfile;
  }

  const fullName = [
    finalProfile?.first_name,
    finalProfile?.last_name,
  ]
    .filter((value) => typeof value === "string" && value.trim() !== "")
    .join(" ")
    .trim();

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      first_name: finalProfile?.first_name ?? null,
      last_name: finalProfile?.last_name ?? null,
      full_name: fullName || null,
      city: finalProfile?.city ?? null,
      phone: finalProfile?.phone ?? null,
      address: finalProfile?.address ?? null,
      gender: finalProfile?.gender ?? null,
    },
  });

  if (metadataError) {
    return NextResponse.json(
      {
        error: `Profil enregistré mais metadata non mise à jour : ${metadataError.message}`,
      },
      { status: 500 }
    );
  }

  revalidatePath("/compte");
  revalidatePath("/compte/parametres");

  return NextResponse.json({
    success: true,
    profile: finalProfile,
  });
}