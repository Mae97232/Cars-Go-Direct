import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";
import { getProAccounts } from "@/lib/server/pro-accounts";
import { getListings } from "@/lib/server/listings";
import { getAllUsersForAdmin } from "@/lib/server/admin-users";
import { getAdsForAdmin } from "@/lib/server/admin-ads";
import { getAdminLogs } from "@/lib/server/admin-logs";
import AdminProActions from "@/components/AdminProActions";
import AdminListingActions from "@/components/Adminlistingactions";
import AdminUserActions from "@/components/AdminUserActions";
import AdminAdActions from "@/components/AdminAdActions";

function formatPriceEUR(value: number) {
  return value.toLocaleString("fr-FR") + " €";
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("fr-FR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR");
}

function badgeClass(status: string) {
  switch (status) {
    case "Validé":
    case "approved":
    case "Publiée":
    case "published":
    case "Payé":
    case "active":
    case "Actif":
    case "Active":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "En attente":
    case "pending":
    case "manual_review":
    case "paused":
    case "Pause":
    case "En pause":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Refusé":
    case "rejected":
    case "Échoué":
    case "archived":
    case "Suspendu":
    case "Archivée":
      return "border-red-200 bg-red-50 text-red-700";
    case "Brouillon":
    case "draft":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
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

function formatAdStatus(status: string) {
  switch (status) {
    case "active":
      return "Active";
    case "paused":
      return "En pause";
    case "archived":
      return "Archivée";
    case "draft":
      return "Brouillon";
    default:
      return status;
  }
}

function StatBlock({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="border-b border-[#ececec] py-3">
      <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[20px] font-semibold tracking-tight text-black">
        {value}
      </p>
    </div>
  );
}

function SectionTitle({
  title,
  text,
  action,
}: {
  title: string;
  text?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#ececec] pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-[15px] font-semibold tracking-tight text-black">
          {title}
        </h2>
        {text ? <p className="mt-1 text-[12px] text-slate-500">{text}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default async function AdminPage() {
  await requireAdmin();

  const [pros, listings, users, ads, adminLogs] = await Promise.all([
    getProAccounts(),
    getListings(),
    getAllUsersForAdmin(),
    getAdsForAdmin(),
    getAdminLogs(),
  ]);

  const totalPros = pros.length;
  const pendingPros = pros.filter(
    (p: any) =>
      p.verification_status === "pending" ||
      p.verification_status === "manual_review"
  ).length;

  const pendingListings = listings.filter((l: any) => l.status === "pending").length;
  const publishedListings = listings.filter((l: any) => l.status === "published").length;
  const draftListings = listings.filter((l: any) => l.status === "draft").length;

  const totalUsers = users.length;
  const totalBuyers = users.filter((u: any) => u.kind === "Particulier").length;
  const totalAdmins = users.filter((u: any) => u.is_admin).length;
  const suspendedUsers = users.filter((u: any) => u.is_suspended).length;
  const activeAds = ads.filter((ad: any) => ad.status === "active").length;

  return (
    <div className="mx-auto w-full max-w-[1500px] bg-white px-4 py-6 text-[13px] text-slate-700 sm:px-6 sm:py-8 lg:px-8">
      <section className="border-b border-[#ececec] pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Administration
            </p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-black sm:text-[34px]">
              Tableau de bord admin
            </h1>
            <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-500">
              Gérez les utilisateurs, les comptes professionnels, les annonces,
              les publicités et l’historique de la plateforme dans une interface
              plus sobre, plus plate et plus claire.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/annonces"
              className="inline-flex h-10 items-center justify-center border border-[#e5e7eb] bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:border-black hover:text-black"
            >
              Voir la plateforme
            </Link>
            <Link
              href="/pro/dashboard"
              className="inline-flex h-10 items-center justify-center border border-[#e5e7eb] bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:border-black hover:text-black"
            >
              Espace pro
            </Link>
            <Link
              href="/admin/publicites/nouvelle"
              className="inline-flex h-10 items-center justify-center border border-black bg-black px-4 text-[12px] font-medium text-white transition hover:opacity-90"
            >
              Nouvelle publicité
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-x-10 gap-y-1 border-b border-[#ececec] py-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatBlock label="Utilisateurs" value={totalUsers} />
        <StatBlock label="Particuliers" value={totalBuyers} />
        <StatBlock label="Comptes pros" value={totalPros} />
        <StatBlock label="Pros en attente" value={pendingPros} />
        <StatBlock label="Annonces à modérer" value={pendingListings} />
        <StatBlock label="Annonces publiées" value={publishedListings} />
        <StatBlock label="Brouillons" value={draftListings} />
        <StatBlock label="Admins" value={totalAdmins} />
        <StatBlock label="Comptes suspendus" value={suspendedUsers} />
        <StatBlock label="Pubs actives" value={activeAds} />
      </section>

      <section className="py-8">
        <SectionTitle
          title="Utilisateurs"
          text="Gestion des particuliers, professionnels et administrateurs."
        />

        <div className="mt-5 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ececec] text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Type</th>
                <th className="py-3 pr-4 font-medium">Garage</th>
                <th className="py-3 pr-4 font-medium">Statut</th>
                <th className="py-3 pr-4 font-medium">Admin</th>
                <th className="py-3 pr-4 font-medium">Inscrit le</th>
                <th className="py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((item: any) => (
                <tr key={item.id} className="border-b border-[#f1f1f1] align-top">
                  <td className="py-4 pr-4 text-[13px] font-medium text-black">
                    {item.email}
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">{item.kind}</td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {item.garage_name ?? "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium ${badgeClass(
                        item.is_suspended ? "Suspendu" : "Actif"
                      )}`}
                    >
                      {item.is_suspended ? "Suspendu" : "Actif"}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {item.is_admin ? "Oui" : "Non"}
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <AdminUserActions
                        userId={item.id}
                        isSuspended={item.is_suspended}
                        isAdmin={item.is_admin}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-0 lg:hidden">
          {users.map((item: any) => (
            <div key={item.id} className="border-b border-[#ececec] py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="truncate text-[13px] font-medium text-black">
                    {item.email}
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500">{item.kind}</p>
                </div>
                <span
                  className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium ${badgeClass(
                    item.is_suspended ? "Suspendu" : "Actif"
                  )}`}
                >
                  {item.is_suspended ? "Suspendu" : "Actif"}
                </span>
              </div>

              <div className="mt-3 grid gap-1 text-[12px] text-slate-600">
                <p>Garage : {item.garage_name ?? "—"}</p>
                <p>Admin : {item.is_admin ? "Oui" : "Non"}</p>
                <p>Inscrit le : {formatDate(item.created_at)}</p>
              </div>

              <div className="mt-4">
                <AdminUserActions
                  userId={item.id}
                  isSuspended={item.is_suspended}
                  isAdmin={item.is_admin}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#ececec] py-8">
        <SectionTitle
          title="Comptes professionnels"
          text="Validation des garages, contrôle SIRET et suivi du statut."
        />

        <div className="mt-5 hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#ececec] text-[11px] uppercase tracking-[0.14em] text-slate-400">
                <th className="py-3 pr-4 font-medium">Garage</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">SIRET</th>
                <th className="py-3 pr-4 font-medium">Ville</th>
                <th className="py-3 pr-4 font-medium">Statut</th>
                <th className="py-3 pr-4 font-medium">Créé le</th>
                <th className="py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pros.map((item: any) => (
                <tr key={item.id} className="border-b border-[#f1f1f1] align-top">
                  <td className="py-4 pr-4 text-[13px] font-medium text-black">
                    {item.garage_name}
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {item.profiles?.email ?? "—"}
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {item.siret}
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {item.city ?? "—"}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium ${badgeClass(
                        item.verification_status
                      )}`}
                    >
                      {formatVerificationStatus(item.verification_status)}
                    </span>
                  </td>
                  <td className="py-4 pr-4 text-[12px] text-slate-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <AdminProActions proId={item.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 grid gap-0 lg:hidden">
          {pros.map((item: any) => (
            <div key={item.id} className="border-b border-[#ececec] py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[13px] font-medium text-black">
                    {item.garage_name}
                  </h3>
                  <p className="mt-1 text-[12px] text-slate-500">
                    {item.city ?? "—"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium ${badgeClass(
                    item.verification_status
                  )}`}
                >
                  {formatVerificationStatus(item.verification_status)}
                </span>
              </div>

              <div className="mt-3 grid gap-1 text-[12px] text-slate-600">
                <p>Email : {item.profiles?.email ?? "—"}</p>
                <p>SIRET : {item.siret}</p>
                <p>Créé le : {formatDate(item.created_at)}</p>
              </div>

              <div className="mt-4">
                <AdminProActions proId={item.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-[#ececec] py-8">
        <SectionTitle
          title="Annonces"
          text="Modération et suivi des annonces publiées sur la plateforme."
        />

        <div className="mt-4">
          {listings.length ? (
            <div className="grid gap-0">
              {listings.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 border-b border-[#ececec] py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-black">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">
                      {item.pro_accounts?.garage_name ?? "Garage inconnu"} •{" "}
                      {item.city} • {formatPriceEUR(item.price ?? 0)}
                    </p>
                    <div className="mt-2">
                      <span
                        className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-medium ${badgeClass(
                          item.status
                        )}`}
                      >
                        {formatListingStatus(item.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/annonces/${item.id}`}
                      className="inline-flex h-9 items-center justify-center border border-[#e5e7eb] bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:border-black hover:text-black"
                    >
                      Voir
                    </Link>
                    <AdminListingActions listingId={item.id} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-b border-[#ececec] py-4 text-[12px] text-slate-500">
              Aucune annonce pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#ececec] py-8">
        <SectionTitle
          title="Publicités"
          text="Gestion des campagnes publicitaires du site."
          action={
            <Link
              href="/admin/publicites/nouvelle"
              className="inline-flex h-9 items-center justify-center border border-black bg-black px-4 text-[12px] font-medium text-white transition hover:opacity-90"
            >
              Nouvelle publicité
            </Link>
          }
        />

        <div className="mt-4">
          {ads.length ? (
            <div className="grid gap-0">
              {ads.map((item: any) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 border-b border-[#ececec] py-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0">
                    <h3 className="truncate text-[13px] font-medium text-black">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-[12px] text-slate-500">
                      Placement : {item.placement} • Statut :{" "}
                      {formatAdStatus(item.status)}
                    </p>
                    {item.link_url ? (
                      <p className="mt-1 truncate text-[11px] text-slate-400">
                        Lien : {item.link_url}
                      </p>
                    ) : null}
                  </div>

                  <AdminAdActions adId={item.id} status={item.status} />
                </div>
              ))}
            </div>
          ) : (
            <div className="border-b border-[#ececec] py-4 text-[12px] text-slate-500">
              Aucune publicité pour le moment.
            </div>
          )}
        </div>
      </section>

      <section className="border-t border-[#ececec] py-8">
        <SectionTitle
          title="Paiements"
          text="Aucune donnée réelle affichée tant qu’aucune table de paiements n’est reliée à l’administration."
        />

        <div className="mt-4 border-b border-[#ececec] py-4 text-[12px] text-slate-500">
          Aucun paiement réel n’est affiché pour le moment.
        </div>
      </section>

      <section className="border-t border-[#ececec] py-8">
        <SectionTitle
          title="Historique admin"
          text="Dernières actions effectuées dans le back-office."
        />

        <div className="mt-4">
          {adminLogs.length ? (
            <div className="grid gap-0">
              {adminLogs.map((item: any) => (
                <div key={item.id} className="border-b border-[#ececec] py-4">
                  <p className="text-[13px] font-medium text-black">{item.action}</p>
                  <p className="mt-1 text-[12px] text-slate-500">
                    Cible : {item.target_type}
                    {item.target_id ? ` • ${item.target_id}` : ""}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">
                    {formatDateTime(item.created_at)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-b border-[#ececec] py-4 text-[12px] text-slate-500">
              Aucun log admin pour le moment.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}