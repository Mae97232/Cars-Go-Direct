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
      <div className="animate-fade-up flex flex-wrap items-center gap-2 text-sm text-slate-500">
        <Link href="/compte" className="text-3d-soft font-medium text-[#171311] hover:underline">
          Mon compte
        </Link>
        <span>›</span>
        <span className="text-3d-soft">Favoris</span>
      </div>

      <section className="mt-5 border-b border-[#ece7e0] pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <p className="text-3d-soft text-sm text-slate-500">Compte particulier</p>
            <h1 className="text-3d-hero mt-1 text-3xl font-bold tracking-tight text-black">
              Mes favoris
            </h1>
            <p className="text-3d-soft mt-2 text-sm text-slate-600">
              Retrouvez les annonces que vous avez enregistrées.
            </p>
          </div>

          <Link
            href="/annonces"
            className="text-3d-soft animate-fade-up inline-flex items-center justify-center rounded-2xl border border-[#e4ddd4] bg-white px-4 py-3 text-sm font-medium text-[#171311] transition hover:bg-[#f7f5f2]"
            style={{ animationDelay: "0.12s" }}
          >
            Voir les annonces
          </Link>
        </div>
      </section>

      <section className="py-8">
        {items.length === 0 ? (
          <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f5f3ef]">
              <Heart className="h-6 w-6 text-[#171311]" />
            </div>
            <h2 className="text-3d-title mt-5 text-xl font-semibold text-black">
              Aucun favori pour le moment
            </h2>
            <p className="text-3d-soft mt-2 text-sm leading-7 text-slate-600">
              Ajoutez des annonces à vos favoris pour les retrouver rapidement ici.
            </p>
            <div className="mt-6">
              <Link
                href="/annonces"
                className="text-3d-button inline-flex items-center justify-center rounded-2xl bg-[#171311] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f0d0c]"
              >
                Parcourir les annonces
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item: any, index: number) => {
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
                  className="animate-fade-up group overflow-hidden rounded-[28px] border border-[#e7e2db] bg-white shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:border-[#d4ccc2] hover:shadow-[0_18px_40px_rgba(0,0,0,0.06)]"
                  style={{ animationDelay: `${0.06 + index * 0.04}s` }}
                >
                  <div className="overflow-hidden bg-slate-100">
                    {photo ? (
                      <img
                        src={photo}
                        alt={item.title ?? "Annonce"}
                        className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="text-3d-soft grid aspect-[4/3] place-items-center text-sm text-slate-500">
                        Photo indisponible
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-3d-title line-clamp-2 text-lg font-semibold text-black">
                          {item.title ?? "Annonce véhicule"}
                        </p>
                        <p className="text-3d-soft mt-2 text-sm text-slate-500">{locationText}</p>
                      </div>

                      <span className="text-3d-soft inline-flex rounded-full border border-[#f0d8dd] bg-[#fff5f6] px-3 py-1 text-xs font-semibold text-[#8b3a47]">
                        Favori
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.year || "—"}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {formatKm(item.mileage)}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.fuel || "—"}
                      </span>
                      <span className="text-3d-soft rounded-full bg-[#f5f3ef] px-3 py-1.5 text-xs font-medium text-[#171311]">
                        {item.type || "—"}
                      </span>
                    </div>

                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-3d-title text-xl font-semibold tracking-tight text-black">
                        {formatPrice(item.price)}
                      </p>
                      <span className="text-3d-title text-sm font-medium text-[#171311]">
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