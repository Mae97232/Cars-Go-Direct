import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getListingById } from "@/lib/server/listing-detail";
import ContactSellerCard from "@/components/ContactSellerCard";
import FavoriteButton from "@/components/FavoriteButton";

type ProAccount = {
  id?: string | number;
  garage_name?: string | null;
  siret?: string | null;
  phone?: string | null;
  city?: string | null;
  verification_status?: string | null;
  profile_id?: string | null;
};

type RelatedListing = {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  city: string;
  department: string;
  fuel: string;
  type: string;
  photos: string[] | null;
};

const EQUIPMENT_CATEGORIES = [
  {
    category: "Confort",
    items: [
      "Climatisation automatique",
      "Sièges chauffants",
      "Sellerie cuir",
      "Toit ouvrant panoramique",
      "Démarrage sans clé",
    ],
  },
  {
    category: "Sécurité",
    items: [
      "Aide au stationnement",
      "Radar avant",
      "Radar arrière",
      "Caméra de recul",
      "Détecteur d’angle mort",
      "Régulateur de vitesse",
      "Limiteur de vitesse",
    ],
  },
  {
    category: "Multimédia",
    items: ["Bluetooth", "GPS", "Apple CarPlay", "Android Auto"],
  },
  {
    category: "Extérieur",
    items: ["Jantes alliage", "Feux LED", "Hayon électrique"],
  },
] as const;

function formatPriceEUR(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Prix non renseigné";
  }
  return value.toLocaleString("fr-FR") + " €";
}

function formatNumber(value: number | null | undefined, suffix = "") {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return value.toLocaleString("fr-FR") + suffix;
}

function formatStatus(status: string | null | undefined) {
  switch (status) {
    case "published":
      return "Publiée";
    case "pending":
      return "En attente";
    case "draft":
      return "Brouillon";
    case "rejected":
      return "Masquée";
    default:
      return status || "Statut inconnu";
  }
}

function formatDateFR(value: string | null | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("fr-FR");
}

function formatBooleanLabel(
  value: boolean | null | undefined,
  yes = "Oui",
  no = "Non"
) {
  if (typeof value !== "boolean") return "—";
  return value ? yes : no;
}

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function getValidPhotos(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (photo): photo is string => typeof photo === "string" && photo.trim() !== ""
  );
}

function getListingPhoto(listing: RelatedListing) {
  const photos = getValidPhotos(listing.photos);
  return photos[0] || null;
}

function groupEquipmentByCategory(
  equipment: string[]
): { category: string; items: string[] }[] {
  const categorized: { category: string; items: string[] }[] =
    EQUIPMENT_CATEGORIES.map((group) => ({
      category: group.category,
      items: group.items.filter((entry) => equipment.includes(entry)),
    })).filter((group) => group.items.length > 0);

  const knownItems = new Set<string>(
    EQUIPMENT_CATEGORIES.flatMap((group) => [...group.items])
  );

  const uncategorized = equipment.filter((entry) => !knownItems.has(entry));

  if (uncategorized.length > 0) {
    categorized.push({
      category: "Autres équipements",
      items: uncategorized,
    });
  }

  return categorized;
}

function ProPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-sky-300 bg-white px-3 py-1 text-[12px] font-medium text-sky-700">
      {children}
    </span>
  );
}

function SoftTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-[12px] font-medium text-slate-700">
      {children}
    </span>
  );
}

function DetailSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
      <div>
        <h2 className="text-[18px] font-semibold text-slate-900 sm:text-[20px]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[14px] text-slate-500">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[13px] text-slate-500">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-slate-900 sm:text-[16px]">
        {value}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 py-3 last:border-b-0">
      <span className="text-[14px] text-slate-500">{label}</span>
      <span className="text-right text-[14px] font-medium text-slate-900 sm:text-[15px]">
        {value}
      </span>
    </div>
  );
}

function RelatedCard({ item }: { item: RelatedListing }) {
  const photo = getListingPhoto(item);
  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city || item.department || "Localisation non renseignée";

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
    >
      <div className="overflow-hidden bg-slate-100">
        {photo ? (
          <img
            src={photo}
            alt={item.title}
            className="aspect-[4/3] h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500">
            Photo indisponible
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="text-[18px] font-bold text-slate-900">
          {formatPriceEUR(item.price)}
        </div>

        <h3 className="mt-1 line-clamp-2 text-[14px] font-medium leading-5 text-slate-900">
          {item.title}
        </h3>

        <p className="mt-2 text-[13px] text-slate-600">
          {item.year || "—"} • {formatNumber(item.mileage, " km")}
        </p>

        <p className="mt-1 text-[13px] text-slate-500">
          {item.fuel || "—"} • {item.type || "—"}
        </p>

        <p className="mt-2 text-[13px] text-slate-500">{locationText}</p>
      </div>
    </Link>
  );
}

export default async function AnnonceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getListingById(id);

  if (!item || item.status !== "published") {
    return (
      <div className="min-h-screen bg-[#f8f8f8]">
        <div className="container-app py-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h1 className="text-2xl font-semibold text-slate-900">
              Annonce introuvable
            </h1>
            <p className="mt-2 text-[15px] text-slate-600">
              L’annonce n’existe pas, n’est plus disponible ou n’est pas publiée.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/annonces"
                className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Retour aux annonces
              </Link>

              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isFavorite = false;

  if (user) {
    const { data: favorite } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("listing_id", String(item.id))
      .maybeSingle();

    isFavorite = !!favorite;
  }

  let currentProAccountId: string | null = null;

  if (user) {
    const { data: currentProAccount } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

    currentProAccountId = currentProAccount?.id
      ? String(currentProAccount.id)
      : null;
  }

  const isOwner =
    currentProAccountId !== null &&
    String(item.pro_account_id) === String(currentProAccountId);

  const rawProAccount = Array.isArray(item.pro_accounts)
    ? item.pro_accounts[0]
    : item.pro_accounts;

  const proAccount = (rawProAccount ?? null) as ProAccount | null;

  const garageId = item.pro_account_id
    ? String(item.pro_account_id)
    : proAccount?.id
    ? String(proAccount.id)
    : "";

  let garageName = proAccount?.garage_name ?? "Garage";
  let garageSiret = proAccount?.siret ?? null;
  let garagePhone = proAccount?.phone ?? null;
  let garageCity = proAccount?.city ?? null;
  let garageVerificationStatus = proAccount?.verification_status ?? null;
  let garageProfileId = proAccount?.profile_id ?? null;
  let garageAvatarUrl: string | null = null;

  if (garageId) {
    const { data: fullProAccount } = await supabase
      .from("pro_accounts")
      .select("id, garage_name, siret, phone, city, verification_status, profile_id")
      .eq("id", garageId)
      .maybeSingle();

    if (fullProAccount) {
      garageName = fullProAccount.garage_name ?? garageName;
      garageSiret = fullProAccount.siret ?? garageSiret;
      garagePhone = fullProAccount.phone ?? garagePhone;
      garageCity = fullProAccount.city ?? garageCity;
      garageVerificationStatus =
        fullProAccount.verification_status ?? garageVerificationStatus;
      garageProfileId = fullProAccount.profile_id ?? garageProfileId;
    }
  }

  if (garageProfileId) {
    const { data: sellerProfile } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", garageProfileId)
      .maybeSingle();

    garageAvatarUrl = sellerProfile?.avatar_url ?? null;
  }

  const garageInitials = getInitials(garageName) || "G";

  const photos = getValidPhotos(item.photos);
  const mainPhoto = photos[0] || null;
  const sidePhotos = photos.slice(1, 5);

  const locationText =
    item.city && item.department
      ? `${item.city} (${item.department})`
      : item.city
      ? item.city
      : item.department
      ? item.department
      : "Localisation non renseignée";

  const garageLocationText =
    garageCity && item.department
      ? `${garageCity} (${item.department})`
      : garageCity || locationText;

  const customHighlights = Array.isArray(item.highlights)
    ? item.highlights.filter(
        (entry: unknown): entry is string =>
          typeof entry === "string" && entry.trim() !== ""
      )
    : [];

  const defaultHighlights = [
    item.vat_recoverable ? "TVA récupérable" : null,
    item.fuel ? item.fuel : null,
    item.type ? item.type : null,
    item.transmission ? item.transmission : null,
    item.year ? `Année ${item.year}` : null,
    item.mileage ? `${formatNumber(item.mileage, " km")}` : null,
    garageVerificationStatus === "approved" ? "Professionnel vérifié" : null,
  ].filter(Boolean) as string[];

  const highlights =
    customHighlights.length > 0 ? customHighlights : defaultHighlights;

  const equipment = Array.isArray(item.equipment)
    ? item.equipment.filter(
        (entry: unknown): entry is string =>
          typeof entry === "string" && entry.trim() !== ""
      )
    : [];

  const groupedEquipment = groupEquipmentByCategory(equipment);

  const keyInfos = [
    { label: "Marque", value: item.brand || "—" },
    { label: "Modèle", value: item.model || "—" },
    { label: "Année modèle", value: item.year || "—" },
    { label: "Kilométrage", value: formatNumber(item.mileage, " km") },
    { label: "Énergie", value: item.fuel || "—" },
    { label: "Boîte de vitesse", value: item.transmission || "—" },
    { label: "Nombre de portes", value: formatNumber(item.doors) },
    { label: "Nombre de place(s)", value: formatNumber(item.seats) },
  ];

  const extraInfos = [
    {
      label: "Première mise en circulation",
      value: formatDateFR(item.first_registration),
    },
    { label: "Ville", value: item.city || "—" },
    { label: "Département", value: item.department || "—" },
    {
      label: "TVA récupérable",
      value: formatBooleanLabel(item.vat_recoverable),
    },
    {
      label: "Carnet d’entretien",
      value: formatBooleanLabel(
        item.maintenance_book,
        "Disponible",
        "Non renseigné"
      ),
    },
    {
      label: "Historique du véhicule",
      value: item.vehicle_history || "Non renseigné",
    },
    {
      label: "Disponibilité des pièces",
      value: item.parts_availability || "Non renseignée",
    },
    { label: "Couleur", value: item.color || "—" },
    {
      label: "Puissance DIN",
      value: item.power_din ? `${item.power_din} ch` : "—",
    },
    {
      label: "Puissance fiscale",
      value: item.fiscal_power ? `${item.fiscal_power} cv` : "—",
    },
  ];

  const { data: garageListingsData } = await supabase
    .from("listings")
    .select(
      `
      id,
      title,
      brand,
      model,
      year,
      mileage,
      price,
      city,
      department,
      fuel,
      type,
      photos
    `
    )
    .eq("status", "published")
    .eq("pro_account_id", item.pro_account_id)
    .neq("id", item.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const garageListings = (garageListingsData ?? []) as RelatedListing[];

  const { data: similarListingsData } = await supabase
    .from("listings")
    .select(
      `
      id,
      title,
      brand,
      model,
      year,
      mileage,
      price,
      city,
      department,
      fuel,
      type,
      photos
    `
    )
    .eq("status", "published")
    .eq("brand", item.brand)
    .eq("type", item.type)
    .neq("id", item.id)
    .order("created_at", { ascending: false })
    .limit(4);

  const similarListings = (similarListingsData ?? []) as RelatedListing[];

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      <div className="container-app py-4 sm:py-5 lg:py-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/annonces"
            className="inline-flex items-center gap-2 text-[14px] font-medium text-slate-700 transition hover:text-slate-950"
          >
            <span>←</span>
            <span>Retour aux annonces</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-500">
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5">
              Réf : {String(item.id)}
            </span>
            <span className="rounded-full border border-slate-300 bg-white px-3 py-1.5">
              {formatStatus(item.status)}
            </span>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="min-w-0 space-y-5 sm:space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-3">
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  {mainPhoto ? (
                    <img
                      src={mainPhoto}
                      alt={item.title || "Photo principale"}
                      className="aspect-[16/10] h-full w-full object-cover sm:aspect-[16/9]"
                    />
                  ) : (
                    <div className="grid aspect-[16/10] place-items-center text-sm text-slate-500 sm:aspect-[16/9]">
                      Photo principale indisponible
                    </div>
                  )}

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2 sm:left-4 sm:top-4">
                    <span className="rounded-full bg-fuchsia-600 px-3 py-1 text-[12px] font-semibold text-white">
                      À la une
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                      {photos.length > 0
                        ? `${photos.length} photo${photos.length > 1 ? "s" : ""}`
                        : "Galerie"}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                          Professionnel
                        </span>
                        {item.vat_recoverable ? (
                          <span className="rounded-full bg-white px-3 py-1 text-[12px] font-medium text-slate-900">
                            TVA récupérable
                          </span>
                        ) : null}
                      </div>

                      <div className="hidden text-[12px] text-white/90 sm:block">
                        {locationText}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
                  {sidePhotos.length > 0 ? (
                    sidePhotos.map((photo, index) => (
                      <div
                        key={`${photo}-${index}`}
                        className="overflow-hidden rounded-2xl bg-slate-100"
                      >
                        <img
                          src={photo}
                          alt={`${item.title || "Annonce"} photo ${index + 2}`}
                          className="aspect-[4/3] h-full w-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                        Photo
                      </div>
                      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                        Photo
                      </div>
                      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                        Photo
                      </div>
                      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                        Photo
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <ProPill>Pro</ProPill>
                    <SoftTag>{formatStatus(item.status)}</SoftTag>
                    {item.vat_recoverable ? <SoftTag>TVA récupérable</SoftTag> : null}
                  </div>

                  <h1 className="mt-3 max-w-4xl text-[24px] font-bold leading-8 tracking-[-0.02em] text-slate-900 sm:text-[30px] sm:leading-10 lg:text-[34px] lg:leading-[42px]">
                    {item.title || "Annonce véhicule"}
                  </h1>

                  <p className="mt-3 text-[14px] leading-7 text-slate-600 sm:text-[15px]">
                    {locationText} • {item.year || "—"} • {formatNumber(item.mileage, " km")}
                    {item.fuel ? ` • ${item.fuel}` : ""}
                    {item.transmission ? ` • ${item.transmission}` : ""}
                    {item.type ? ` • ${item.type}` : ""}
                  </p>

                  {highlights.length > 0 ? (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {highlights.map((highlight) => (
                        <SoftTag key={highlight}>{highlight}</SoftTag>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="shrink-0 lg:min-w-[220px]">
                  <div className="text-[28px] font-bold leading-none text-emerald-700 sm:text-[32px]">
                    {formatPriceEUR(item.price)}
                  </div>
                  <p className="mt-2 text-[14px] text-slate-500">
                    Vendu par {garageName}
                  </p>

                  {!isOwner ? (
                    <div className="mt-4">
                      <FavoriteButton
                        listingId={String(item.id)}
                        initialIsFavorite={isFavorite}
                      />
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 grid gap-3 grid-cols-2 xl:grid-cols-4">
                <InfoCard label="Année" value={item.year || "—"} />
                <InfoCard label="Kilométrage" value={formatNumber(item.mileage, " km")} />
                <InfoCard label="Énergie" value={item.fuel || "—"} />
                <InfoCard label="Boîte de vitesse" value={item.transmission || "—"} />
              </div>
            </section>

            <DetailSection
              title="Informations clés"
              subtitle="Les principales caractéristiques du véhicule"
            >
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {keyInfos.map((info) => (
                  <InfoCard key={info.label} label={info.label} value={info.value} />
                ))}
              </div>
            </DetailSection>

            {groupedEquipment.length > 0 ? (
              <DetailSection
                title="Équipements"
                subtitle="Les équipements renseignés dans l’annonce"
              >
                <div className="grid gap-4 sm:gap-5">
                  {groupedEquipment.map((group) => (
                    <div key={group.category} className="rounded-2xl border border-slate-200 p-4">
                      <h3 className="text-[15px] font-semibold text-slate-900">
                        {group.category}
                      </h3>

                      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {group.items.map((entry) => (
                          <div
                            key={`${group.category}-${entry}`}
                            className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[14px] text-slate-700"
                          >
                            {entry}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </DetailSection>
            ) : null}

            <DetailSection
              title="Historique et entretien"
              subtitle="Informations utiles pour l’achat"
            >
              <div className="grid gap-x-16 md:grid-cols-2">
                {extraInfos.map((info) => (
                  <InfoRow key={info.label} label={info.label} value={info.value} />
                ))}
              </div>
            </DetailSection>

            <DetailSection
              title="Description"
              subtitle="Détails complémentaires sur le véhicule"
            >
              <div className="max-w-5xl">
                <p className="whitespace-pre-wrap text-[14px] leading-7 text-slate-700 sm:text-[15px] sm:leading-8">
                  {item.description && item.description.trim() !== ""
                    ? item.description
                    : "Aucune description fournie pour le moment."}
                </p>
              </div>
            </DetailSection>

            <DetailSection
              title="Le vendeur"
              subtitle="Informations sur le professionnel"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  {garageAvatarUrl ? (
                    <img
                      src={garageAvatarUrl}
                      alt={garageName}
                      className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                    />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                      {garageInitials}
                    </div>
                  )}

                  <div>
                    <p className="text-[18px] font-semibold text-slate-900">
                      {garageName}
                    </p>
                    <p className="mt-1 text-[14px] text-slate-600">{garageLocationText}</p>
                    <p className="mt-1 text-[14px] text-slate-500">
                      SIRET : {garageSiret || "Non renseigné"}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {garageVerificationStatus === "approved" ? (
                        <SoftTag>Professionnel vérifié</SoftTag>
                      ) : (
                        <SoftTag>Professionnel</SoftTag>
                      )}
                      <SoftTag>Annonce active</SoftTag>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-auto">
                  <Link
                    href={`/garage/${String(garageId)}`}
                    className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-[14px] font-medium text-slate-900 transition hover:bg-slate-50 lg:w-auto"
                  >
                    Voir le garage
                  </Link>
                </div>
              </div>
            </DetailSection>

            {garageListings.length > 0 ? (
              <DetailSection
                title="Autres annonces du garage"
                subtitle={`D’autres véhicules proposés par ${garageName}`}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {garageListings.map((listing) => (
                    <RelatedCard key={listing.id} item={listing} />
                  ))}
                </div>
              </DetailSection>
            ) : null}

            {similarListings.length > 0 ? (
              <DetailSection
                title="Annonces similaires"
                subtitle="Des véhicules proches de cette annonce"
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {similarListings.map((listing) => (
                    <RelatedCard key={listing.id} item={listing} />
                  ))}
                </div>
              </DetailSection>
            ) : null}
          </main>

          <aside className="min-w-0">
            <div className="space-y-5 xl:sticky xl:top-24">
              <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-4 py-5 sm:px-5">
                  <div className="flex items-start gap-3">
                    {garageAvatarUrl ? (
                      <img
                        src={garageAvatarUrl}
                        alt={garageName}
                        className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                        {garageInitials}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-[16px] font-semibold text-slate-900">
                        {garageName}
                      </p>
                      <p className="mt-1 text-[13px] text-slate-500">
                        SIRET : {garageSiret || "Non renseigné"}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <ProPill>Pro</ProPill>
                        {garageVerificationStatus === "approved" ? (
                          <SoftTag>Vérifié</SoftTag>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-4 py-5 sm:px-5">
                  {!isOwner ? (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          Prix affiché
                        </p>
                        <p className="mt-2 text-[28px] font-bold leading-none text-emerald-700 sm:text-[30px]">
                          {formatPriceEUR(item.price)}
                        </p>
                        <p className="mt-3 text-[13px] text-slate-500">
                          {item.title || "Annonce véhicule"}
                        </p>
                      </div>

                      <ContactSellerCard
                        listingId={String(item.id)}
                        listingTitle={item.title || "Annonce"}
                        garageId={String(item.pro_account_id ?? garageId ?? "")}
                        garageName={garageName}
                        garagePhone={garagePhone || undefined}
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <h3 className="text-[15px] font-semibold text-slate-900">
                          Votre annonce
                        </h3>
                        <p className="mt-2 text-[14px] leading-7 text-slate-600">
                          Vous êtes le propriétaire de cette annonce. Le formulaire
                          de contact est masqué sur votre propre fiche.
                        </p>
                      </div>

                      <Link
                        href="/pro/dashboard"
                        className="inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-[14px] font-medium text-white transition hover:bg-slate-800"
                      >
                        Retour au dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="text-[15px] font-semibold text-slate-900">
                  Avant d’acheter
                </h3>

                <ul className="mt-4 space-y-3 text-[14px] leading-7 text-slate-600">
                  <li>Vérifiez les documents et l’état général du véhicule.</li>
                  <li>Demandez l’entretien, les factures et l’historique.</li>
                  <li>Essayez le véhicule avant toute décision d’achat.</li>
                  <li>Confirmez la disponibilité avec le vendeur.</li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}