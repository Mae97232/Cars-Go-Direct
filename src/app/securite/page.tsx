export default function SecuritePage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-[26px] font-semibold tracking-tight text-slate-900 sm:text-[30px]">
          Sécurité
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Cars Go Direct met en œuvre des mesures pour sécuriser la plateforme
          et protéger les utilisateurs.
        </p>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">
          <section className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">
              Vérification des professionnels
            </h2>
            <p className="mt-2">
              Les comptes professionnels sont soumis à une vérification
              du numéro SIRET afin de limiter les annonces frauduleuses.
            </p>
          </section>

          <section className="rounded-md border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-semibold text-slate-900">
              Paiements sécurisés
            </h2>
            <p className="mt-2">
              Les paiements liés à la publication d’annonces sont effectués
              via des prestataires sécurisés.
            </p>
          </section>

          <section className="rounded-md border border-slate-200 bg-slate-50 p-5">
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