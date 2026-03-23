export default function AidePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Centre d’aide
        </h1>

        <p className="text-3d-soft mt-2 text-slate-600">
          Retrouvez ici les informations pour utiliser la plateforme Cars Go Direct.
        </p>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">
          
          <section className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5">
            <h2 className="text-3d-title font-semibold text-black">
              Publier une annonce
            </h2>
            <p className="text-3d-soft mt-2">
              Pour publier une annonce, vous devez créer un compte professionnel
              et vérifier votre numéro SIRET. Une fois votre compte validé,
              vous pouvez déposer vos annonces depuis votre dashboard.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.06s" }}
          >
            <h2 className="text-3d-title font-semibold text-black">
              Contacter un vendeur
            </h2>
            <p className="text-3d-soft mt-2">
              Chaque annonce contient les coordonnées du garage ou du professionnel.
              Vous pouvez contacter directement le vendeur pour obtenir plus
              d’informations sur le véhicule.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.12s" }}
          >
            <h2 className="text-3d-title font-semibold text-black">
              Paiement des annonces
            </h2>
            <p className="text-3d-soft mt-2">
              La publication d’une annonce peut être soumise à un paiement.
              Le paiement est sécurisé et effectué directement sur la plateforme.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}