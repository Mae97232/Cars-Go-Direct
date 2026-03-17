export default function FAQPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 sm:p-8">

        <h1 className="text-2xl font-extrabold tracking-tight">
          Questions fréquentes
        </h1>

        <div className="mt-8 grid gap-6 text-sm text-slate-700">

          <div>
            <h3 className="font-semibold text-slate-900">
              Qui peut publier une annonce ?
            </h3>
            <p className="mt-2">
              Seuls les professionnels et garages disposant d’un numéro SIRET
              valide peuvent publier des annonces.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Combien coûte une annonce ?
            </h3>
            <p className="mt-2">
              Le tarif de publication est indiqué sur la plateforme au moment
              du dépôt d’annonce.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              La plateforme prend-elle une commission sur la vente ?
            </h3>
            <p className="mt-2">
              Non. La plateforme facture uniquement la publication d’annonce.
              La vente du véhicule se fait directement entre le vendeur et
              l’acheteur.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              Comment contacter le support ?
            </h3>
            <p className="mt-2">
              Vous pouvez utiliser la page contact disponible sur la plateforme.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}