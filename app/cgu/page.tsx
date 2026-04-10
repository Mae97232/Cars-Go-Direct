export default function CGUPage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Conditions générales d’utilisation
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Consultez les règles applicables à l’utilisation de la plateforme Cars Go Direct.
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Objet du service
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct est une plateforme dédiée à la publication et à la consultation
              d’annonces de véhicules professionnels et utilitaires.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Accès au site
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              L’accès au site est libre pour les visiteurs souhaitant consulter les annonces.
              Certaines fonctionnalités, notamment la publication d’annonces, sont réservées
              aux professionnels disposant d’un compte validé.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Comptes professionnels
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les professionnels s’engagent à fournir des informations exactes, à jour et
              complètes lors de leur inscription, notamment leur numéro SIRET. Cars Go Direct
              se réserve le droit de refuser, suspendre ou supprimer un compte ne respectant pas
              ces obligations.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Contenu des annonces
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les utilisateurs sont responsables des contenus publiés sur la plateforme. Il leur
              appartient de s’assurer que les informations relatives au véhicule sont exactes,
              loyales et non trompeuses.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Modération
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct se réserve le droit de refuser, masquer ou supprimer toute annonce
              ou tout compte qui contrevient aux présentes conditions, à la loi ou à l’intérêt
              de la plateforme.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}