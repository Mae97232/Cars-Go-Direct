import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  BadgeCheck,
  CarFront,
  CircleAlert,
  Eye,
  MapPin,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";
import { requireAuth } from "@/lib/auth-guard";
import { createClient } from "@/lib/supabase/server";

type DashboardListing = {
  id: string | number;
  title: string | null;
  price: number | null;
  city: string | null;
  status: string | null;
  created_at: string | null;
  pro_account_id?: string | number | null;
  photos?: string[] | null;
};

function formatPriceEUR(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Prix non renseigné";
  }

  return value.toLocaleString("fr-FR") + " €";
}

function formatDateFR(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR");
}

function formatStatusLabel(status: string | null | undefined) {
  switch (status) {
    case "published":
      return "Publiée";
    case "pending":
      return "En attente";
    case "draft":
      return "Brouillon";
    case "rejected":
      return "Masquée";
    case "archived":
      return "Archivée";
    default:
      return status || "Inconnu";
  }
}

function statusClass(status: string | null | undefined) {
  switch (status) {
    case "published":
      return "bg-orange-50 text-orange-600";
    case "pending":
      return "bg-amber-50 text-amber-700";
    case "draft":
      return "bg-slate-100 text-slate-700";
    case "rejected":
      return "bg-red-50 text-red-700";
    case "archived":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getInitial(name: string | null | undefined) {
  return (name || "G").trim().charAt(0).toUpperCase();
}

export default async function ProDashboardPage() {
  await requireAuth();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/pro/connexion");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, avatar_url, first_name, last_name, phone, city, address")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Impossible de charger le profil : ${profileError.message}`);
  }

  if (profile?.role !== "pro") {
    redirect("/compte");
  }

  const avatarUrl = profile?.avatar_url || null;

  const profileCompleted = Boolean(
    profile?.first_name &&
      profile?.last_name &&
      profile?.phone &&
      profile?.city &&
      profile?.address
  );

  const { data: proAccount, error: proAccountError } = await supabase
    .from("pro_accounts")
    .select("id, garage_name, city, verification_status")
    .eq("profile_id", user.id)
    .single();

  if (proAccountError || !proAccount) {
    redirect("/pro/inscription");
  }

  async function archiveListingAction(formData: FormData) {
    "use server";

    const listingId = String(formData.get("listingId") || "");

    if (!listingId) {
      throw new Error("ID d’annonce manquant.");
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/pro/connexion");
    }

    const { data: currentProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (currentProfile?.role !== "pro") {
      throw new Error("Accès refusé.");
    }

    const { data: currentProAccount, error: currentProAccountError } = await supabase
      .from("pro_accounts")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (currentProAccountError || !currentProAccount) {
      throw new Error("Compte professionnel introuvable.");
    }

    const { data: existingListing, error: existingListingError } = await supabase
      .from("listings")
      .select("id, pro_account_id")
      .eq("id", listingId)
      .single();

    if (existingListingError || !existingListing) {
      throw new Error("Annonce introuvable.");
    }

    if (String(existingListing.pro_account_id) !== String(currentProAccount.id)) {
      throw new Error("Accès refusé.");
    }

    const { error: archiveError } = await supabase
      .from("listings")
      .update({
        status: "archived",
      })
      .eq("id", listingId);

    if (archiveError) {
      throw new Error("Impossible de supprimer l’annonce.");
    }

    revalidatePath("/pro/dashboard");
  }

  const { data: listingsData, error: listingsError } = await supabase
    .from("listings")
    .select("id, title, price, city, status, created_at, pro_account_id, photos")
    .eq("pro_account_id", proAccount.id)
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  if (listingsError) {
    throw new Error(
      `Impossible de charger les annonces du garage : ${listingsError.message}`
    );
  }

  const myListings: DashboardListing[] = Array.isArray(listingsData)
    ? listingsData
    : [];

  const totalListings = myListings.length;
  const publishedListings = myListings.filter((a) => a.status === "published").length;
  const pendingListings = myListings.filter((a) => a.status === "pending").length;
  const draftListings = myListings.filter((a) => a.status === "draft").length;

  const garageName = proAccount.garage_name || "Mon garage";
  const garageInitial = getInitial(garageName);

  return (
    <div className="mx-auto max-w-7xl bg-white px-4 py-5 text-slate-900 sm:px-6">
      <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={garageName}
                className="h-14 w-14 rounded-full object-cover ring-1 ring-slate-200 sm:h-16 sm:w-16"
              />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-full bg-slate-900 text-xl font-bold text-white sm:h-16 sm:w-16">
                {garageInitial}
              </div>
            )}

            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                Espace professionnel
              </p>

              <h1 className="mt-1 text-lg font-semibold text-slate-900 sm:text-xl">
                {garageName}
              </h1>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600 sm:text-sm">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {proAccount.city || "Ville non renseignée"}
                </span>

                <span className="text-slate-300">•</span>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    proAccount.verification_status === "approved"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {proAccount.verification_status === "approved" ? (
                    <BadgeCheck className="h-3.5 w-3.5" />
                  ) : (
                    <CircleAlert className="h-3.5 w-3.5" />
                  )}
                  {proAccount.verification_status === "approved"
                    ? "Compte validé"
                    : "Validation en attente"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/pro/deposer"
              className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              Déposer une annonce
            </Link>
            <Link
              href="/pro/messages"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
            >
              Messages
            </Link>
            <Link
              href="/pro/parametres"
              className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
            >
              Paramètres
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs sm:text-sm">
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
            {totalListings} annonce{totalListings > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-orange-50 px-3 py-1.5 text-orange-600">
            {publishedListings} publiée{publishedListings > 1 ? "s" : ""}
          </span>
          <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
            {pendingListings} en attente
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-700">
            {draftListings} brouillon{draftListings > 1 ? "s" : ""}
          </span>
        </div>
      </section>

      <section className="mt-4 flex flex-wrap gap-3">
        <Link
          href="/pro/deposer"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouvelle annonce
        </Link>

        <Link
          href="/pro/messages"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
        >
          <MessageSquare className="h-4 w-4" />
          Messagerie
        </Link>

        <Link
          href="/pro/parametres"
          className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
        >
          <Settings className="h-4 w-4" />
          Paramètres
        </Link>
      </section>

      <section className="mt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Mes annonces
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Gérez vos véhicules publiés et en préparation.
            </p>
          </div>

          <Link
            href="/annonces"
            className="text-sm font-medium text-slate-600 hover:text-orange-600"
          >
            Voir le site public
          </Link>
        </div>

        {myListings.length === 0 ? (
          <div className="border border-slate-200 bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-slate-100 text-slate-600">
              <CarFront className="h-6 w-6" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Aucune annonce pour le moment
            </h3>

            <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
              {profileCompleted
                ? "Ajoutez votre premier véhicule pour commencer à recevoir des contacts."
                : "Ajoutez votre premier véhicule et complétez votre profil pour commencer à recevoir des contacts."}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link
                href="/pro/deposer"
                className="inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-5 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Déposer ma première annonce
              </Link>

              {!profileCompleted ? (
                <Link
                  href="/pro/parametres"
                  className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600"
                >
                  Compléter mon profil
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {myListings.map((item) => (
              <div
                key={String(item.id)}
                className="overflow-hidden border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:bg-slate-50"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="h-36 w-full shrink-0 border-b border-slate-200 bg-slate-100 sm:h-auto sm:w-[190px] sm:border-b-0 sm:border-r">
                    {item.photos && item.photos.length > 0 ? (
                      <img
                        src={item.photos[0]}
                        alt={item.title || "Véhicule"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-slate-400">
                        <CarFront className="h-8 w-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                              item.status
                            )}`}
                          >
                            {formatStatusLabel(item.status)}
                          </span>

                          <span className="text-[11px] text-slate-400">
                            Créée le {formatDateFR(item.created_at)}
                          </span>
                        </div>

                        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-slate-900 sm:text-base">
                          {item.title || "Annonce sans titre"}
                        </h3>

                        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600 sm:text-sm">
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {item.city || "Ville non renseignée"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        <p className="text-base font-bold text-orange-600 sm:text-lg">
                          {formatPriceEUR(item.price)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link
                        href={`/annonces/${item.id}`}
                        className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        Voir
                      </Link>

                      <Link
                        href={`/pro/annonces/${item.id}/modifier`}
                        className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600 sm:text-sm"
                      >
                        Modifier
                      </Link>

                      <form action={archiveListingAction}>
                        <input type="hidden" name="listingId" value={String(item.id)} />
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 sm:text-sm"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}