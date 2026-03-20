export default function CGVPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Conditions générales de vente
        </h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">
          <section className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5">
            <h2 className="text-3d-title text-base font-bold text-black">
              Objet
            </h2>
            <p className="text-3d-soft mt-2">
              Les présentes conditions générales de vente encadrent les services payants proposés
              par Cars Go Direct aux professionnels souhaitant publier des annonces sur la
              plateforme.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.05s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Service vendu
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct commercialise un service de publication d’annonce. Le montant affiché
              au moment de la commande correspond au prix de mise en ligne d’une annonce sur la
              plateforme, selon les conditions en vigueur.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.1s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Prix
            </h2>
            <p className="text-3d-soft mt-2">
              Le prix de publication est indiqué sur la plateforme avant validation du paiement.
              À titre d’exemple, la publication d’une annonce peut être facturée 7€ selon la
              politique tarifaire active au moment de l’achat.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.15s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Paiement
            </h2>
            <p className="text-3d-soft mt-2">
              Le paiement s’effectue sur la plateforme via un prestataire sécurisé. La publication
              de l’annonce peut être conditionnée à la confirmation du paiement.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Absence de commission sur la vente
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct n’intervient pas comme intermédiaire dans le paiement du véhicule
              entre l’acheteur et le garage. La vente finale du véhicule se fait directement entre
              les parties, hors plateforme.
            </p>
          </section>

          <section
            className="animate-fade-up rounded-2xl border border-[#ece7e0] bg-[#faf7f2] p-5"
            style={{ animationDelay: "0.25s" }}
          >
            <h2 className="text-3d-title text-base font-bold text-black">
              Remboursement
            </h2>
            <p className="text-3d-soft mt-2">
              Sauf disposition particulière, une annonce publiée et conforme au service commandé
              ne donne pas lieu à remboursement, notamment une fois la publication activée.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}