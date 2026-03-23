import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { getProAccounts } from "@/lib/server/pro-accounts";
import { getListings } from "@/lib/server/listings";
import AdminProActions from "@/components/AdminProActions";
import AdminListingActions from "@/components/Adminlistingactions";

const payments = [
  {
    id: "pay_1",
    garage: "Garage Normandie Auto",
    listing: "Volkswagen Golf 6",
    amount: 7,
    status: "Payé",
    createdAt: "2026-03-01",
  },
  {
    id: "pay_2",
    garage: "Rouen Utilitaires",
    listing: "Renault Master L2H2",
    amount: 7,
    status: "En attente",
    createdAt: "2026-03-03",
  },
  {
    id: "pay_3",
    garage: "Caen Véhicules Pro",
    listing: "Peugeot Partner",
    amount: 7,
    status: "Échoué",
    createdAt: "2026-03-05",
  },
];

function formatPriceEUR(value: number) {
  return value.toLocaleString("fr-FR") + " €";
}

function badgeClass(status: string) {
  switch (status) {
    case "Validé":
    case "approved":
    case "Publiée":
    case "published":
    case "Payé":
      return "bg-green-50 text-green-700 border-green-200";
    case "En attente":
    case "pending":
    case "manual_review":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "Refusé":
    case "rejected":
    case "Échoué":
      return "bg-red-50 text-red-700 border-red-200";
    case "Brouillon":
    case "draft":
      return "bg-slate-50 text-slate-700 border-slate-200";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function formatVerificationStatus(status: string) {
  switch (status) {
    case "approved":
      return "Validé";
    case "pending":
      return "En attente";
    case "manual_review":
      return "Vérification manuelle";
    case "rejected":
      return "Refusé";
    default:
      return status;
  }
}

function formatListingStatus(status: string) {
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
      return status;
  }
}

export default async function AdminPage() {
  await requireAdmin();

  const pros = await getProAccounts();
  const listings = await getListings();

  const totalPros = pros.length;
  const pendingPros = pros.filter(
    (p: any) =>
      p.verification_status === "pending" ||
      p.verification_status === "manual_review"
  ).length;

  const pendingListings = listings.filter((l: any) => l.status === "pending").length;

  const paidPayments = payments.filter((p) => p.status === "Payé").length;
  const totalRevenue = payments
    .filter((p) => p.status === "Payé")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="grid gap-6">
      <section className="card p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm text-slate-500">Administration</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tableau de bord admin
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Gérez les comptes professionnels, les annonces et les paiements de la
              plateforme.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/annonces" className="btn btn-secondary">
              Voir la plateforme
            </Link>
            <Link href="/pro/dashboard" className="btn btn-secondary">
              Espace pro
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card p-5">
          <p className="text-sm text-slate-500">Comptes pros</p>
          <p className="mt-2 text-2xl font-extrabold">{totalPros}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Pros en attente</p>
          <p className="mt-2 text-2xl font-extrabold">{pendingPros}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Annonces à modérer</p>
          <p className="mt-2 text-2xl font-extrabold">{pendingListings}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Paiements validés</p>
          <p className="mt-2 text-2xl font-extrabold">{paidPayments}</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-slate-500">Revenus</p>
          <p className="mt-2 text-2xl font-extrabold">{formatPriceEUR(totalRevenue)}</p>
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Comptes professionnels</h2>
            <p className="text-sm text-slate-600">Validation des garages et contrôle SIRET.</p>
          </div>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600">
              <tr>
                <th className="px-5 py-4 text-left font-semibold">Garage</th>
                <th className="px-5 py-4 text-left font-semibold">Email</th>
                <th className="px-5 py-4 text-left font-semibold">SIRET</th>
                <th className="px-5 py-4 text-left font-semibold">Ville</th>
                <th className="px-5 py-4 text-left font-semibold">Statut</th>
                <th className="px-5 py-4 text-left font-semibold">Créé le</th>
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pros.map((item: any) => (
                <tr key={item.id} className="border-b border-slate-200 last:border-0">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {item.garage_name}
                  </td>
                  <td className="px-5 py-4">{item.profiles?.email ?? "—"}</td>
                  <td className="px-5 py-4">{item.siret}</td>
                  <td className="px-5 py-4">{item.city ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                        item.verification_status
                      )}`}
                    >
                      {formatVerificationStatus(item.verification_status)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {new Date(item.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <AdminProActions proId={item.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid gap-4 p-4 lg:hidden">
          {pros.map((item: any) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{item.garage_name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.city ?? "—"}</p>
                </div>
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                    item.verification_status
                  )}`}
                >
                  {formatVerificationStatus(item.verification_status)}
                </span>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <p>
                  <span className="text-slate-500">Email :</span> {item.profiles?.email ?? "—"}
                </p>
                <p>
                  <span className="text-slate-500">SIRET :</span> {item.siret}
                </p>
                <p>
                  <span className="text-slate-500">Créé le :</span>{" "}
                  {new Date(item.created_at).toLocaleDateString("fr-FR")}
                </p>
              </div>

              <div className="mt-4">
                <AdminProActions proId={item.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Annonces</h2>
            <p className="text-sm text-slate-600">Modération et suivi des annonces publiées.</p>
          </div>
        </div>

        <div className="grid gap-4 p-4">
          {listings.length ? (
            listings.map((item: any) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {item.pro_accounts?.garage_name ?? "Garage inconnu"} • {item.city} •{" "}
                    {formatPriceEUR(item.price)}
                  </p>
                  <div className="mt-2">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                        item.status
                      )}`}
                    >
                      {formatListingStatus(item.status)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link href={`/annonces/${item.id}`} className="btn btn-secondary !px-4 !py-2">
                    Voir
                  </Link>
                  <AdminListingActions listingId={item.id} />
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
              Aucune annonce pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">Paiements</h2>
            <p className="text-sm text-slate-600">
              Suivi des paiements liés à la publication des annonces.
            </p>
          </div>
        </div>

        <div className="grid gap-4 p-4">
          {payments.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <h3 className="font-semibold">{item.listing}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {item.garage} • {formatPriceEUR(item.amount)} • {item.createdAt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeClass(
                    item.status
                  )}`}
                >
                  {item.status}
                </span>

                <button className="btn btn-secondary !px-4 !py-2">
                  Détails
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}