export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8 md:p-10">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Mentions légales
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Consultez les informations légales relatives à l’éditeur et à l’exploitation du site Cars Go Direct.
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Éditeur du site
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct
              <br />
              Plateforme de diffusion d’annonces de véhicules professionnels et utilitaires.
              <br />
              Email : cargodirect.contact@gmail.com
              <br />
              Téléphone : Non communiqué
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Responsable de publication
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Le responsable de publication est le représentant légal de Cars Go Direct.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Hébergement
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Le site est hébergé par :
              <br />
              Hostinger International Ltd.
              <br />
              Adresse : 61 Lordou Vironos Street, 6023 Larnaca, Chypre
              <br />
              Site : https://www.hostinger.fr
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Propriété intellectuelle
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              L’ensemble des contenus présents sur le site Cars Go Direct, incluant notamment
              les textes, images, logos, éléments graphiques, structure et code, est protégé
              par le droit de la propriété intellectuelle. Toute reproduction, représentation,
              modification ou exploitation, totale ou partielle, sans autorisation préalable
              écrite est strictement interdite.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Responsabilité
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct s’efforce d’assurer l’exactitude des informations diffusées sur la
              plateforme. Toutefois, la responsabilité de l’éditeur ne saurait être engagée en cas
              d’erreur, d’omission, d’indisponibilité du service ou de contenus publiés par des
              utilisateurs tiers.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900 sm:text-lg">
              Droit applicable
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les présentes mentions légales sont soumises au droit français. En cas de litige,
              et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort
              du siège de l’éditeur.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}