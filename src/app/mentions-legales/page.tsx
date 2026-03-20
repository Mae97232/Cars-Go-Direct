export default function MentionsLegalesPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8 md:p-10">
        
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black sm:text-3xl">
          Mentions légales
        </h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">

          {/* Éditeur */}
          <section className="animate-fade-up" style={{ animationDelay: "0.04s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Éditeur du site
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct
              <br />
              Plateforme de diffusion d’annonces de véhicules professionnels et utilitaires.
              <br />
              Email : cargodirect.contact@gmail.com
              <br />
              Téléphone : Non communiqué
            </p>
          </section>

          {/* Responsable */}
          <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Responsable de publication
            </h2>
            <p className="text-3d-soft mt-2">
              Le responsable de publication est le représentant légal de Cars Go Direct.
            </p>
          </section>

          {/* Hébergement */}
          <section className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Hébergement
            </h2>
            <p className="text-3d-soft mt-2">
              Le site est hébergé par :
              <br />
              Hostinger International Ltd.
              <br />
              Adresse : 61 Lordou Vironos Street, 6023 Larnaca, Chypre
              <br />
              Site : https://www.hostinger.fr
            </p>
          </section>

          {/* Propriété */}
          <section className="animate-fade-up" style={{ animationDelay: "0.16s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Propriété intellectuelle
            </h2>
            <p className="text-3d-soft mt-2">
              L’ensemble des contenus présents sur le site Cars Go Direct, incluant notamment
              les textes, images, logos, éléments graphiques, structure et code, est protégé
              par le droit de la propriété intellectuelle. Toute reproduction, représentation,
              modification ou exploitation, totale ou partielle, sans autorisation préalable
              écrite est strictement interdite.
            </p>
          </section>

          {/* Responsabilité */}
          <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Responsabilité
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct s’efforce d’assurer l’exactitude des informations diffusées sur la
              plateforme. Toutefois, la responsabilité de l’éditeur ne saurait être engagée en cas
              d’erreur, d’omission, d’indisponibilité du service ou de contenus publiés par des
              utilisateurs tiers.
            </p>
          </section>

          {/* Droit applicable */}
          <section className="animate-fade-up" style={{ animationDelay: "0.24s" }}>
            <h2 className="text-3d-title text-base font-bold text-black sm:text-lg">
              Droit applicable
            </h2>
            <p className="text-3d-soft mt-2">
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