export default function ConfidentialitePage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Politique de confidentialité
        </h1>

        <div className="mt-6 grid gap-6 text-sm leading-7 text-slate-700">
          <section className="animate-fade-up" style={{ animationDelay: "0.04s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">
              Données collectées
            </h2>
            <p className="text-3d-soft mt-2">
              Cars Go Direct peut collecter les données suivantes : nom, prénom, email,
              téléphone, informations d’entreprise, SIRET, contenu des annonces, messages
              transmis via les formulaires et données de navigation nécessaires au bon
              fonctionnement de la plateforme.
            </p>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.08s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">Finalités</h2>
            <p className="text-3d-soft mt-2">
              Ces données sont utilisées pour gérer les comptes utilisateurs, permettre la
              publication d’annonces, assurer la vérification des professionnels, traiter les
              paiements liés à la publication, répondre aux demandes de contact et améliorer
              le service.
            </p>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.12s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">Conservation</h2>
            <p className="text-3d-soft mt-2">
              Les données sont conservées pendant la durée strictement nécessaire à la gestion
              de la relation commerciale, au respect des obligations légales et à la sécurité
              de la plateforme.
            </p>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.16s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">
              Partage des données
            </h2>
            <p className="text-3d-soft mt-2">
              Les données ne sont pas revendues. Elles peuvent être transmises aux prestataires
              techniques nécessaires au fonctionnement du site, notamment l’hébergement, les
              services de paiement et les outils techniques utilisés pour l’exploitation de la
              plateforme.
            </p>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">
              Droits des utilisateurs
            </h2>
            <p className="text-3d-soft mt-2">
              Conformément à la réglementation applicable, vous disposez d’un droit d’accès,
              de rectification, de suppression, d’opposition, de limitation et de portabilité
              de vos données, dans les limites prévues par la loi.
            </p>
          </section>

          <section className="animate-fade-up" style={{ animationDelay: "0.24s" }}>
            <h2 className="text-3d-title text-base font-bold text-black">Contact</h2>
            <p className="text-3d-soft mt-2">
              Pour toute demande relative à vos données personnelles, vous pouvez écrire à :
              contact@carsgodirect.fr
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}