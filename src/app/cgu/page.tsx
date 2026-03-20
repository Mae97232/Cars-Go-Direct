export default function CGUPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Conditions générales d’utilisation
        </h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">

          <section className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5">
            <h2 className="text-3d-title text-base font-bold text-black">
              Objet du service
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct est une plateforme dédiée à la publication et à la consultation
              d’annonces de véhicules professionnels et utilitaires.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Accès au site
            </h2>
            <p className="text-3d-soft mt-2">
              L’accès au site est libre pour les visiteurs souhaitant consulter les annonces.
              Certaines fonctionnalités, notamment la publication d’annonces, sont réservées
              aux professionnels disposant d’un compte validé.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Comptes professionnels
            </h2>
            <p className="text-3d-soft mt-2">
              Les professionnels s’engagent à fournir des informations exactes, à jour et
              complètes lors de leur inscription, notamment leur numéro SIRET. Cars Go Direct
              se réserve le droit de refuser, suspendre ou supprimer un compte ne respectant pas
              ces obligations.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.15s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Contenu des annonces
            </h2>
            <p className="text-3d-soft mt-2">
              Les utilisateurs sont responsables des contenus publiés sur la plateforme. Il leur
              appartient de s’assurer que les informations relatives au véhicule sont exactes,
              loyales et non trompeuses.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Modération
            </h2>
            <p className="text-3d-soft mt-2">
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