export default function SecuritePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 sm:p-8">

        <h1 className="text-2xl font-extrabold tracking-tight">
          Sécurité
        </h1>

        <p className="mt-2 text-slate-600">
          Cars Go Direct met en œuvre des mesures pour sécuriser la plateforme
          et protéger les utilisateurs.
        </p>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">

          <section>
            <h2 className="font-semibold text-slate-900">
              Vérification des professionnels
            </h2>
            <p className="mt-2">
              Les comptes professionnels sont soumis à une vérification
              du numéro SIRET afin de limiter les annonces frauduleuses.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Paiements sécurisés
            </h2>
            <p className="mt-2">
              Les paiements liés à la publication d’annonces sont effectués
              via des prestataires sécurisés.
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-slate-900">
              Signaler une annonce
            </h2>
            <p className="mt-2">
              Si vous constatez une annonce suspecte ou frauduleuse,
              vous pouvez contacter notre support via la page contact.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}