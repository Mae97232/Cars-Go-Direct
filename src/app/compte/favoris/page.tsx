import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number | null) {
  if (!value) return "Prix non renseigné";
  return value.toLocaleString("fr-FR") + " €";
}

function formatKm(value: number | null) {
  if (!value) return "—";
  return value.toLocaleString("fr-FR") + " km";
}

export default async function CompteFavorisPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/connexion");
  }

  const { data: favorites, error } = await supabase
    .from("favorites")
    .select(
      `
      id,
      created_at,
      listings (
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
        photos,
        description
      )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Impossible de charger les favoris.");
  }

  const items =
    favorites
      ?.map((fav) => {
        const listing = Array.isArray(fav.listings) ? fav.listings[0] : fav.listings;
        return listing ? { favoriteId: fav.id, ...listing } : null;
      })
      .filter(Boolean) ?? [];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/compte" className="font-medium text-slate-700 hover:underline">
          Mon compte
        </Link>
        <span>›</span>
        <span>Favoris</span>
      </div>

      <section className="mt-5 border-b border-slate-200 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Compte particulier</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
              Mes favoris
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Retrouvez les annonces que vous avez enregistrées.
            </p>
          </div>

          <Link
            href="/annonces"
            className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      <section className="py-8">
        {items.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Heart className="h-6 w-6 text-slate-700" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              Aucun favori pour le moment
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Ajoutez des annonces à vos favoris pour les retrouver rapidement ici.
            </p>
            <div className="mt-6">
              <Link
                href="/annonces"
                className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Parcourir les annonces
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item: any) => {
              const photo =
                Array.isArray(item.photos) && item.photos.length > 0 ? item.photos[0] : "";

              const locationText =
                item.city && item.department
                  ? `${item.city} (${item.department})`
                  : item.city || item.department || "Localisation non renseignée";

              return (
                <Link
                  key={item.id}
                  href={`/annonces/${item.id}`}
                  className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white transition hover:border-slate-300 hover:shadow-sm"
                >
                  <div className="overflow-hidden bg-slate-100">
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.title ?? "Annonce"}
                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="grid aspect-[4/3] place-items-center text-sm text-slate-500">
                        Photo indisponible
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-lg font-semibold text-slate-900">
                          {item.title ?? "Annonce véhicule"}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">{locationText}</p>
                      </div>

                      <span className="inline-flex rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        Favori
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {item.year || "—"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {formatKm(item.mileage)}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {item.fuel || "—"}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {item.type || "—"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-xl font-semibold tracking-tight text-slate-950">
                        {formatPrice(item.price)}
                      </p>
                      <span className="text-sm font-medium text-slate-700">
                        Voir l’annonce
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}