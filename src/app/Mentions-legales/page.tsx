export default function MentionsLegalesPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 sm:p-8">
        <h1 className="text-2xl font-extrabold tracking-tight">Mentions légales</h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-base font-bold text-slate-900">Éditeur du site</h2>
            <p className="mt-2">
              Cars Go Direct
              <br />
              Plateforme de diffusion d’annonces de véhicules professionnels et utilitaires.
              <br />
              Email : contact@carsgodirect.fr
              <br />
              Téléphone : 00 00 00 00 00
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Responsable de publication</h2>
            <p className="mt-2">
              Le responsable de publication est le représentant légal de Cars Go Direct.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Hébergement</h2>
            <p className="mt-2">
              Le site est hébergé par le prestataire choisi par l’éditeur du site.
              <br />
              Nom de l’hébergeur : à compléter
              <br />
              Adresse : à compléter
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Propriété intellectuelle</h2>
            <p className="mt-2">
              L’ensemble des contenus présents sur le site Cars Go Direct, incluant notamment
              les textes, images, logos, éléments graphiques, structure et code, est protégé
              par le droit de la propriété intellectuelle. Toute reproduction, représentation,
              diffusion ou exploitation, totale ou partielle, sans autorisation préalable écrite,
              est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-900">Responsabilité</h2>
            <p className="mt-2">
              Cars Go Direct met en œuvre tous les moyens raisonnables pour assurer l’exactitude
              des informations diffusées sur la plateforme. Toutefois, la responsabilité de
              l’éditeur ne saurait être engagée en cas d’erreur, d’omission, d’interruption
              temporaire du service ou d’informations inexactes publiées par des utilisateurs.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}