export default function AidePage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Centre d’aide
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Retrouvez ici les informations pour utiliser la plateforme Cars Go Direct.
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Publier une annonce
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pour publier une annonce, vous devez créer un compte professionnel
              et vérifier votre numéro SIRET. Une fois votre compte validé,
              vous pouvez déposer vos annonces depuis votre dashboard.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Contacter un vendeur
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Chaque annonce contient les coordonnées du garage ou du professionnel.
              Vous pouvez contacter directement le vendeur pour obtenir plus
              d’informations sur le véhicule.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Paiement des annonces
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              La publication d’une annonce peut être soumise à un paiement.
              Le paiement est sécurisé et effectué directement sur la plateforme.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}