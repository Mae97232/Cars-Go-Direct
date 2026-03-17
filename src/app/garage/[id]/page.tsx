import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Building2,
  CarFront,
  Clock3,
  Eye,
  Globe,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type GaragePageProps = {
  params: Promise<{
    id: string;
  }>;
};

type GarageData = {
  id: string;
  garage_name: string | null;
  city: string | null;
  verification_status: string | null;
  profile_id: string | null;
  siret?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  zip_code?: string | null;
  opening_hours?: string | null;
  description?: string | null;
};

type ProfileData = {
  id: string;
  avatar_url: string | null;
  city?: string | null;
};

type ListingData = {
  id: string;
  title: string | null;
  price: number | null;
  city: string | null;
  status: string | null;
  photos: string[] | null;
  created_at: string | null;
};

function formatPriceEUR(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Prix non renseigné";
  }

  return value.toLocaleString("fr-FR") + " €";
}

function getInitial(name: string | null | undefined) {
  return (name || "G").trim().charAt(0).toUpperCase();
}

function formatWebsite(url: string) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

export default async function GaragePublicPage({ params }: GaragePageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: garage, error: garageError } = await supabase
    .from("pro_accounts")
    .select(
      "id, garage_name, city, verification_status, profile_id, siret, phone, email, website, address, zip_code, opening_hours, description"
    )
    .eq("id", id)
    .maybeSingle();

  if (garageError) {
    throw new Error(`Impossible de charger le garage : ${garageError.message}`);
  }

  if (!garage) {
    notFound();
  }

  const typedGarage = garage as GarageData;

  let profile: ProfileData | null = null;

  if (typedGarage.profile_id) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, avatar_url, city")
      .eq("id", typedGarage.profile_id)
      .maybeSingle();

    profile = profileData as ProfileData | null;
  }

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, price, city, status, photos, created_at")
    .eq("pro_account_id", typedGarage.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (listingsError) {
    throw new Error(`Impossible de charger les annonces : ${listingsError.message}`);
  }

  const garageName = typedGarage.garage_name || "Garage";
  const garageInitial = getInitial(garageName);
  const avatarUrl = profile?.avatar_url || null;
  const displayCity = typedGarage.city || profile?.city || "Ville non renseignée";
  const fullAddress = [typedGarage.address, typedGarage.zip_code, displayCity]
    .filter(Boolean)
    .join(", ");
  const websiteUrl = typedGarage.website ? formatWebsite(typedGarage.website) : "";
  const publishedListings = (listings || []) as ListingData[];

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={garageName}
                  className="h-20 w-20 rounded-full object-cover ring-1 ring-slate-200 sm:h-24 sm:w-24"
                />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full bg-slate-900 text-3xl font-bold text-white sm:h-24 sm:w-24">
                  {garageInitial}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-sm text-slate-500">Le vendeur</p>

                <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {garageName}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {displayCity}
                  </span>

                  {typedGarage.verification_status === "approved" ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Professionnel vérifié
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Vérification en attente
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
                  {typedGarage.siret ? <p>SIRET : {typedGarage.siret}</p> : null}
                  <p>
                    {publishedListings.length} annonce
                    {publishedListings.length > 1 ? "s" : ""} publiée
                    {publishedListings.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {typedGarage.phone ? (
                <a
                  href={`tel:${typedGarage.phone}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Phone className="h-4 w-4" />
                  Appeler le garage
                </a>
              ) : null}

              <Link
                href="/annonces"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Retour aux annonces
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-10 py-8 lg:grid-cols-[1.45fr_.95fr]">
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Présentation du garage
              </h2>

              <div className="mt-4">
                {typedGarage.description ? (
                  <p className="whitespace-pre-line text-[15px] leading-8 text-slate-700">
                    {typedGarage.description}
                  </p>
                ) : (
                  <p className="text-[15px] leading-8 text-slate-500">
                    Ce garage n’a pas encore ajouté de présentation détaillée.
                  </p>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Annonces du garage
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Retrouvez les véhicules actuellement disponibles.
              </p>

              {publishedListings.length === 0 ? (
                <div className="mt-6 border-t border-slate-200 py-10 text-center">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-slate-100 text-slate-500">
                    <CarFront className="h-7 w-7" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-slate-900">
                    Aucune annonce publiée
                  </h3>

                  <p className="mt-2 text-sm text-slate-600">
                    Ce garage n’a pas encore de véhicule visible pour le moment.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {publishedListings.map((item) => (
                    <div
                      key={String(item.id)}
                      className="overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row">
                        <div className="h-52 w-full shrink-0 bg-slate-100 md:h-auto md:w-[280px]">
                          {item.photos && item.photos.length > 0 ? (
                            <img
                              src={item.photos[0]}
                              alt={item.title || "Véhicule"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="grid h-full w-full place-items-center text-slate-400">
                              <CarFront className="h-9 w-9" />
                            </div>
                          )}
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-slate-900">
                                {item.title || "Annonce sans titre"}
                              </h3>

                              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {item.city || "Ville non renseignée"}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <p className="text-2xl font-bold tracking-tight text-slate-900">
                                {formatPriceEUR(item.price)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            <Link
                              href={`/annonces/${item.id}`}
                              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye className="h-4 w-4" />
                              Voir l’annonce
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Coordonnées
              </h2>

              <div className="mt-5 space-y-4 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <span>{displayCity}</span>
                </div>

                {fullAddress ? (
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>{fullAddress}</span>
                  </div>
                ) : null}

                {typedGarage.phone ? (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                    <a href={`tel:${typedGarage.phone}`} className="hover:text-slate-900">
                      {typedGarage.phone}
                    </a>
                  </div>
                ) : null}

                {typedGarage.email ? (
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                    <a
                      href={`mailto:${typedGarage.email}`}
                      className="break-all hover:text-slate-900"
                    >
                      {typedGarage.email}
                    </a>
                  </div>
                ) : null}

                {websiteUrl ? (
                  <div className="flex items-start gap-3">
                    <Globe className="mt-0.5 h-4 w-4 text-slate-400" />
                    <a
                      href={websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all hover:text-slate-900"
                    >
                      {typedGarage.website}
                    </a>
                  </div>
                ) : null}

                {typedGarage.siret ? (
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                    <span>SIRET : {typedGarage.siret}</span>
                  </div>
                ) : null}
              </div>
            </div>

            {typedGarage.opening_hours ? (
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Horaires d’ouverture
                </h2>

                <div className="mt-5 flex items-start gap-3 text-sm leading-7 text-slate-700">
                  <Clock3 className="mt-1 h-4 w-4 text-slate-400" />
                  <p className="whitespace-pre-line">{typedGarage.opening_hours}</p>
                </div>
              </div>
            ) : null}

            <div>
              <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                Acheter en confiance
              </h2>

              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-600">
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>Vérifiez les documents et l’état général du véhicule.</p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>Demandez les factures, l’entretien et l’historique.</p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>Essayez toujours le véhicule avant toute décision.</p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-400" />
                  <p>Confirmez la disponibilité directement avec le garage.</p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}