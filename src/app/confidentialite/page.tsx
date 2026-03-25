export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-4xl bg-white text-slate-900">
      <div className="border border-slate-200 bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-[26px] font-semibold text-slate-900 sm:text-[30px]">
            Politique de confidentialité
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Consultez les informations relatives à la collecte et au traitement de vos données personnelles.
          </p>
        </div>

        <div className="mt-6 grid gap-4 text-sm leading-7 text-slate-700">
          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Données collectées
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cars Go Direct peut collecter les données suivantes : nom, prénom, email,
              téléphone, informations d’entreprise, SIRET, contenu des annonces, messages
              transmis via les formulaires et données de navigation nécessaires au bon
              fonctionnement de la plateforme.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Finalités
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Ces données sont utilisées pour gérer les comptes utilisateurs, permettre la
              publication d’annonces, assurer la vérification des professionnels, traiter les
              paiements liés à la publication, répondre aux demandes de contact et améliorer
              le service.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Conservation
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les données sont conservées pendant la durée strictement nécessaire à la gestion
              de la relation commerciale, au respect des obligations légales et à la sécurité
              de la plateforme.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Partage des données
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Les données ne sont pas revendues. Elles peuvent être transmises aux prestataires
              techniques nécessaires au fonctionnement du site, notamment l’hébergement, les
              services de paiement et les outils techniques utilisés pour l’exploitation de la
              plateforme.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Droits des utilisateurs
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Conformément à la réglementation applicable, vous disposez d’un droit d’accès,
              de rectification, de suppression, d’opposition, de limitation et de portabilité
              de vos données, dans les limites prévues par la loi.
            </p>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <h2 className="text-base font-semibold text-slate-900">
              Contact
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pour toute demande relative à vos données personnelles, vous pouvez écrire à :
              cargodirect.contact@gmail.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}