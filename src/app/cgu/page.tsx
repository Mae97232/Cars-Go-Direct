export default function CGUPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Conditions générales d’utilisation
        </h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900">Objet du service</h2>
            <p className="mt-2">
              Cars Go Direct est une plateforme dédiée à la publication et à la consultation
              d’annonces de véhicules professionnels et utilitaires.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Accès au site</h2>
            <p className="mt-2">
              L’accès au site est libre pour les visiteurs souhaitant consulter les annonces.
              Certaines fonctionnalités, notamment la publication d’annonces, sont réservées
              aux professionnels disposant d’un compte validé.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Comptes professionnels</h2>
            <p className="mt-2">
              Les professionnels s’engagent à fournir des informations exactes, à jour et
              complètes lors de leur inscription, notamment leur numéro SIRET. Cars Go Direct
              se réserve le droit de refuser, suspendre ou supprimer un compte ne respectant pas
              ces obligations.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Contenu des annonces</h2>
            <p className="mt-2">
              Les utilisateurs sont responsables des contenus publiés sur la plateforme. Il leur
              appartient de s’assurer que les informations relatives au véhicule sont exactes,
              loyales et non trompeuses.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Modération</h2>
            <p className="mt-2">
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