import Link from "next/link";
import type { Listing } from "@/lib/data";

function formatPriceEUR(value: number) {
  return value.toLocaleString("fr-FR") + " €";
}

type ListingCardProps = {
  item: Listing;
};

export default function ListingCard({ item }: ListingCardProps) {
  const mainPhoto =
    Array.isArray(item.photos) && item.photos.length > 0
      ? item.photos[0]
      : null;

  return (
    <Link
      href={`/annonces/${item.id}`}
      className="card group block overflow-hidden transition hover:shadow-md"
    >
      <div className="flex gap-4 p-5">
        <div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          {mainPhoto ? (
            <img
              src={mainPhoto}
              alt={item.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-slate-500">
              Photo
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold tracking-tight text-slate-900">
                {item.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {item.city} ({item.department}) • {item.year} •{" "}
                {item.mileage.toLocaleString("fr-FR")} km
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">
                {formatPriceEUR(item.price)}
              </p>
              <p className="mt-1 text-xs text-slate-500 group-hover:text-slate-600">
                Voir l’annonce
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.type && <span className="badge">{item.type}</span>}
            {item.fuel && <span className="badge">{item.fuel}</span>}
            {item.vatRecoverable && (
              <span className="badge">TVA récupérable</span>
            )}
          </div>

          {item.description && (
            <p className="mt-3 line-clamp-2 text-sm text-slate-600">
              {item.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}