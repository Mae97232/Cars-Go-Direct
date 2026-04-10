import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guard";

export default async function NouvellePublicitePage() {
  await requireAdmin();

  return (
    <div className="mx-auto w-full max-w-[900px] bg-white px-4 py-6 text-[13px] text-slate-700 sm:px-6 sm:py-8 lg:px-8">
      <div className="border-b border-[#ececec] pb-6">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
          Administration
        </p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-black sm:text-[34px]">
          Nouvelle publicité
        </h1>
        <p className="mt-3 max-w-2xl text-[13px] leading-6 text-slate-500">
          Crée une nouvelle publicité pour l’affichage sur la plateforme.
        </p>
      </div>

      <form className="grid gap-6 py-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="grid gap-2">
            <label
              htmlFor="title"
              className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
            >
              Titre
            </label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="Ex : Offre spéciale garage"
              className="h-11 border border-[#e5e7eb] bg-white px-3 text-[13px] text-black outline-none transition focus:border-black"
            />
          </div>

          <div className="grid gap-2">
            <label
              htmlFor="placement"
              className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
            >
              Placement
            </label>
            <select
              id="placement"
              name="placement"
              className="h-11 border border-[#e5e7eb] bg-white px-3 text-[13px] text-black outline-none transition focus:border-black"
              defaultValue=""
            >
              <option value="" disabled>
                Choisir un emplacement
              </option>
              <option value="home_top">Accueil haut</option>
              <option value="home_middle">Accueil milieu</option>
              <option value="listing_top">Liste annonces haut</option>
              <option value="listing_sidebar">Liste annonces côté</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="image_url"
            className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
          >
            Image URL
          </label>
          <input
            id="image_url"
            name="image_url"
            type="text"
            placeholder="https://..."
            className="h-11 border border-[#e5e7eb] bg-white px-3 text-[13px] text-black outline-none transition focus:border-black"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="link_url"
            className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
          >
            Lien de destination
          </label>
          <input
            id="link_url"
            name="link_url"
            type="text"
            placeholder="https://..."
            className="h-11 border border-[#e5e7eb] bg-white px-3 text-[13px] text-black outline-none transition focus:border-black"
          />
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="status"
            className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
          >
            Statut
          </label>
          <select
            id="status"
            name="status"
            className="h-11 border border-[#e5e7eb] bg-white px-3 text-[13px] text-black outline-none transition focus:border-black"
            defaultValue="draft"
          >
            <option value="draft">Brouillon</option>
            <option value="active">Active</option>
            <option value="paused">En pause</option>
            <option value="archived">Archivée</option>
          </select>
        </div>

        <div className="grid gap-2">
          <label
            htmlFor="description"
            className="text-[11px] uppercase tracking-[0.14em] text-slate-400"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            placeholder="Description de la publicité..."
            className="min-h-[120px] border border-[#e5e7eb] bg-white px-3 py-3 text-[13px] text-black outline-none transition focus:border-black"
          />
        </div>

        <div className="flex flex-wrap gap-2 border-t border-[#ececec] pt-6">
          <button
            type="submit"
            className="inline-flex h-10 items-center justify-center border border-black bg-black px-4 text-[12px] font-medium text-white transition hover:opacity-90"
          >
            Enregistrer
          </button>

          <Link
            href="/admin"
            className="inline-flex h-10 items-center justify-center border border-[#e5e7eb] bg-white px-4 text-[12px] font-medium text-slate-700 transition hover:border-black hover:text-black"
          >
            Retour admin
          </Link>
        </div>
      </form>
    </div>
  );
}