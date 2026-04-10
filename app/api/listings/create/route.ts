import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toTrimmedString(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toNullableString(value: unknown) {
  const s = toTrimmedString(value);
  return s ? s : null;
}

function toPositiveNumber(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function toRequiredPositiveNumber(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n;
}

function toSafeStringArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNullableDateString(value: unknown) {
  if (typeof value !== "string" || !value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return value;
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();

    const {
      title,
      brand,
      model,
      year,
      mileage,
      price,
      type,
      fuel,
      transmission,
      vat_recoverable,
      city,
      department,
      color,
      doors,
      seats,
      power_din,
      fiscal_power,
      first_registration,
      description,
      highlights,
      equipment,
      maintenance_book,
      vehicle_history,
      parts_availability,
      photos,
      status,
    } = body;

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
    }

    const { data: proAccount, error: proAccountError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (proAccountError || !proAccount) {
      return NextResponse.json(
        { error: "Compte pro introuvable." },
        { status: 404 }
      );
    }

    const safePhotos = toSafeStringArray(photos);
    const safeHighlights = toSafeStringArray(highlights);
    const safeEquipment = toSafeStringArray(equipment);

    const safeTitle = toTrimmedString(title);
    const safeBrand = toTrimmedString(brand);
    const safeModel = toTrimmedString(model);
    const safeType = toTrimmedString(type);
    const safeFuel = toTrimmedString(fuel);
    const safeTransmission = toTrimmedString(transmission);
    const safeCity = toTrimmedString(city);
    const safeDepartment = toTrimmedString(department);

    if (!safeTitle) {
      return NextResponse.json(
        { error: "Le titre est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeBrand) {
      return NextResponse.json(
        { error: "La marque est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeModel) {
      return NextResponse.json(
        { error: "Le modèle est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeType) {
      return NextResponse.json(
        { error: "Le type est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeFuel) {
      return NextResponse.json(
        { error: "L’énergie est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeTransmission) {
      return NextResponse.json(
        { error: "La boîte de vitesse est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeCity) {
      return NextResponse.json(
        { error: "La ville est obligatoire." },
        { status: 400 }
      );
    }

    if (!safeDepartment) {
      return NextResponse.json(
        { error: "Le département est obligatoire." },
        { status: 400 }
      );
    }

    const payload = {
      pro_account_id: proAccount.id,
      title: safeTitle,
      brand: safeBrand,
      model: safeModel,
      year: toRequiredPositiveNumber(year),
      mileage: toRequiredPositiveNumber(mileage),
      price: toRequiredPositiveNumber(price),
      type: safeType,
      fuel: safeFuel,
      transmission: safeTransmission,
      vat_recoverable: Boolean(vat_recoverable),
      city: safeCity,
      department: safeDepartment,
      color: toNullableString(color),
      doors: toPositiveNumber(doors),
      seats: toPositiveNumber(seats),
      power_din: toPositiveNumber(power_din),
      fiscal_power: toPositiveNumber(fiscal_power),
      first_registration: toNullableDateString(first_registration),
      description: toNullableString(description),
      highlights: safeHighlights,
      equipment: safeEquipment,
      maintenance_book: Boolean(maintenance_book),
      vehicle_history: toNullableString(vehicle_history),
      parts_availability: toNullableString(parts_availability),
      photos: safePhotos,
      status: status === "published" ? "published" : "draft",
    };

    const { data, error } = await supabase
      .from("listings")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert listing error:", error);

      return NextResponse.json(
        { error: error.message || "Impossible de créer l’annonce." },
        { status: 500 }
      );
    }

    return NextResponse.json({ listing: data });
  } catch (error) {
    console.error("API /api/listings/create error:", error);

    return NextResponse.json(
      { error: "Erreur serveur." },
      { status: 500 }
    );
  }
}