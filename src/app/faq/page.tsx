export default function FAQPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="animate-fade-up rounded-[28px] border border-[#e4ddd4] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] sm:p-8">

        {/* TITLE */}
        <h1 className="text-3d-hero text-2xl font-extrabold tracking-tight text-black">
          Questions fréquentes
        </h1>

        {/* CONTENT */}
        <div className="mt-8 grid gap-6 text-sm text-slate-700">

          {/* ITEM */}
          <div className="animate-fade-up rounded-2xl border border-[#ede7df] bg-[#faf8f5] p-5" style={{ animationDelay: "0.04s" }}>
            <h3 className="text-3d-title font-semibold text-black">
              Qui peut publier une annonce ?
            </h3>
            <p className="text-3d-soft mt-2">
              Seuls les professionnels et garages disposant d’un numéro SIRET
              valide peuvent publier des annonces.
            </p>
          </div>

          {/* ITEM */}
          <div className="animate-fade-up rounded-2xl border border-[#ede7df] bg-[#faf8f5] p-5" style={{ animationDelay: "0.08s" }}>
            <h3 className="text-3d-title font-semibold text-black">
              Combien coûte une annonce ?
            </h3>
            <p className="text-3d-soft mt-2">
              Le tarif de publication est indiqué sur la plateforme au moment
              du dépôt d’annonce.
            </p>
          </div>

          {/* ITEM */}
          <div className="animate-fade-up rounded-2xl border border-[#ede7df] bg-[#faf8f5] p-5" style={{ animationDelay: "0.12s" }}>
            <h3 className="text-3d-title font-semibold text-black">
              La plateforme prend-elle une commission sur la vente ?
            </h3>
            <p className="text-3d-soft mt-2">
              Non. La plateforme facture uniquement la publication d’annonce.
              La vente du véhicule se fait directement entre le vendeur et
              l’acheteur.
            </p>
          </div>

          {/* ITEM */}
          <div className="animate-fade-up rounded-2xl border border-[#ede7df] bg-[#faf8f5] p-5" style={{ animationDelay: "0.16s" }}>
            <h3 className="text-3d-title font-semibold text-black">
              Comment contacter le support ?
            </h3>
            <p className="text-3d-soft mt-2">
              Vous pouvez utiliser la page contact disponible sur la plateforme.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}