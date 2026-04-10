import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteParams = Promise<{ id: string }>;

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

export async function GET(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      *,
      pro_accounts:pro_account_id (
        id,
        garage_name,
        phone
      )
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Annonce introuvable." },
      { status: 404 }
    );
  }

  const proAccount = Array.isArray(data.pro_accounts)
    ? data.pro_accounts[0]
    : data.pro_accounts;

  return NextResponse.json({
    listing: {
      ...data,
      garage_id: proAccount?.id ?? data.pro_account_id ?? null,
      garage_name: proAccount?.garage_name ?? "",
      garage_phone: proAccount?.phone ?? "",
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();

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
    vatRecoverable,
    city,
    department,
    color,
    doors,
    seats,
    power_din,
    powerDin,
    fiscal_power,
    fiscalPower,
    first_registration,
    firstRegistration,
    description,
    highlights,
    equipment,
    maintenance_book,
    maintenanceBook,
    vehicle_history,
    vehicleHistory,
    parts_availability,
    partsAvailability,
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

  const { data: existingListing, error: existingListingError } = await supabase
    .from("listings")
    .select("id, pro_account_id")
    .eq("id", id)
    .single();

  if (existingListingError || !existingListing) {
    return NextResponse.json(
      { error: "Annonce introuvable." },
      { status: 404 }
    );
  }

  if (String(existingListing.pro_account_id) !== String(proAccount.id)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

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

  const safePhotos = toSafeStringArray(photos);
  const safeHighlights = toSafeStringArray(highlights);
  const safeEquipment = toSafeStringArray(equipment);

  const updatePayload = {
    title: safeTitle,
    brand: safeBrand,
    model: safeModel,
    year: toRequiredPositiveNumber(year),
    mileage: toRequiredPositiveNumber(mileage),
    price: toRequiredPositiveNumber(price),
    type: safeType,
    fuel: safeFuel,
    transmission: safeTransmission,
    vat_recoverable: Boolean(
      typeof vat_recoverable !== "undefined" ? vat_recoverable : vatRecoverable
    ),
    city: safeCity,
    department: safeDepartment,
    color: toNullableString(color),
    doors: toPositiveNumber(doors),
    seats: toPositiveNumber(seats),
    power_din: toPositiveNumber(
      typeof power_din !== "undefined" ? power_din : powerDin
    ),
    fiscal_power: toPositiveNumber(
      typeof fiscal_power !== "undefined" ? fiscal_power : fiscalPower
    ),
    first_registration: toNullableDateString(
      typeof first_registration !== "undefined"
        ? first_registration
        : firstRegistration
    ),
    description: toNullableString(description),
    highlights: safeHighlights,
    equipment: safeEquipment,
    maintenance_book: Boolean(
      typeof maintenance_book !== "undefined"
        ? maintenance_book
        : maintenanceBook
    ),
    vehicle_history: toNullableString(
      typeof vehicle_history !== "undefined"
        ? vehicle_history
        : vehicleHistory
    ),
    parts_availability: toNullableString(
      typeof parts_availability !== "undefined"
        ? parts_availability
        : partsAvailability
    ),
    photos: safePhotos,
    status: status === "published" ? "published" : "draft",
  };

  const { error } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", id);

  if (error) {
    return NextResponse.json(
      { error: error.message || "Impossible de mettre à jour l’annonce." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: RouteParams }
) {
  const { id } = await params;
  const supabase = await createClient();

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

  const { data: existingListing, error: listingError } = await supabase
    .from("listings")
    .select("id, pro_account_id")
    .eq("id", id)
    .single();

  if (listingError || !existingListing) {
    return NextResponse.json(
      { error: "Annonce introuvable." },
      { status: 404 }
    );
  }

  if (String(existingListing.pro_account_id) !== String(proAccount.id)) {
    return NextResponse.json({ error: "Accès refusé." }, { status: 403 });
  }

  const { error: archiveError } = await supabase
    .from("listings")
    .update({
      status: "archived",
    })
    .eq("id", id);

  if (archiveError) {
    return NextResponse.json(
      { error: archiveError.message || "Impossible de supprimer l’annonce." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}