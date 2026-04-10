export default function CGVPage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Conditions générales de vente
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Consultez les conditions applicables aux services payants de Cars Go Direct.
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Objet
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les présentes conditions générales de vente encadrent les services payants proposés
              par Cars Go Direct aux professionnels souhaitant publier des annonces sur la
              plateforme.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Service vendu
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct commercialise un service de publication d’annonce. Le montant affiché
              au moment de la commande correspond au prix de mise en ligne d’une annonce sur la
              plateforme, selon les conditions en vigueur.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Prix
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Le prix de publication est indiqué sur la plateforme avant validation du paiement.
              À titre d’exemple, la publication d’une annonce peut être facturée 7€ selon la
              politique tarifaire active au moment de l’achat.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Paiement
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Le paiement s’effectue sur la plateforme via un prestataire sécurisé. La publication
              de l’annonce peut être conditionnée à la confirmation du paiement.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Absence de commission sur la vente
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct n’intervient pas comme intermédiaire dans le paiement du véhicule
              entre l’acheteur et le garage. La vente finale du véhicule se fait directement entre
              les parties, hors plateforme.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Remboursement
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Sauf disposition particulière, une annonce publiée et conforme au service commandé
              ne donne pas lieu à remboursement, notamment une fois la publication activée.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}