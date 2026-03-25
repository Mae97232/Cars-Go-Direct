export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">

        {/* HEADER */}
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Questions fréquentes
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Retrouvez les réponses aux questions les plus courantes sur la plateforme.
          </p>
        </div>

        {/* CONTENT */}
        <div className="mt-6 grid gap-4 text-sm text-slate-700">

          {/* ITEM */}
          <div className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="font-semibold text-slate-900">
              Qui peut publier une annonce ?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Seuls les professionnels et garages disposant d’un numéro SIRET
              valide peuvent publier des annonces.
            </p>
          </div>

          {/* ITEM */}
          <div className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="font-semibold text-slate-900">
              Combien coûte une annonce ?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Le tarif de publication est indiqué sur la plateforme au moment
              du dépôt d’annonce.
            </p>
          </div>

          {/* ITEM */}
          <div className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="font-semibold text-slate-900">
              La plateforme prend-elle une commission sur la vente ?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Non. La plateforme facture uniquement la publication d’annonce.
              La vente du véhicule se fait directement entre le vendeur et
              l’acheteur.
            </p>
          </div>

          {/* ITEM */}
          <div className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h3 className="font-semibold text-slate-900">
              Comment contacter le support ?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Vous pouvez utiliser la page contact disponible sur la plateforme.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}