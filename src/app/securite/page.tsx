export default function SecuritePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Sécurité
        </h1>

        <p className="text-3d-soft mt-2 text-slate-600">
          Cars Go Direct met en œuvre des mesures pour sécuriser la plateforme
          et protéger les utilisateurs.
        </p>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">
          <section className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5">
            <h2 className="text-3d-title font-semibold text-black">
              Vérification des professionnels
            </h2>
            <p className="text-3d-soft mt-2">
              Les comptes professionnels sont soumis à une vérification
              du numéro SIRET afin de limiter les annonces frauduleuses.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.06s" }}
          >
            <h2 className="text-3d-title font-semibold text-black">
              Paiements sécurisés
            </h2>
            <p className="text-3d-soft mt-2">
              Les paiements liés à la publication d’annonces sont effectués
              via des prestataires sécurisés.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.12s" }}
          >
            <h2 className="text-3d-title font-semibold text-black">
              Signaler une annonce
            </h2>
            <p className="text-3d-soft mt-2">
              Si vous constatez une annonce suspecte ou frauduleuse,
              vous pouvez contacter notre support via la page contact.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}