export default function AidePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Centre d’aide
        </h1>

        <p className="mt-2 text-slate-600">
          Retrouvez ici les informations pour utiliser la plateforme Cars Go Direct.
        </p>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">

          <section>
            <h2 className="font-semibold text-slate-900">
              Publier une annonce
            </h2>
            <p className="mt-2">
              Pour publier une annonce, vous devez créer un compte professionnel
              et vérifier votre numéro SIRET. Une fois votre compte validé,
              vous pouvez déposer vos annonces depuis votre dashboard.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Contacter un vendeur
            </h2>
            <p className="mt-2">
              Chaque annonce contient les coordonnées du garage ou du professionnel.
              Vous pouvez contacter directement le vendeur pour obtenir plus
              d’informations sur le véhicule.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Paiement des annonces
            </h2>
            <p className="mt-2">
              La publication d’une annonce peut être soumise à un paiement.
              Le paiement est sécurisé et effectué directement sur la plateforme.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}