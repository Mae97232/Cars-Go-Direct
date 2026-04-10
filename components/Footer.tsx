import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white text-slate-700">
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
              Cars Go Direct
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/" className="transition hover:text-[#1e4fae]">
                Accueil
              </Link>

              <Link href="/annonces" className="transition hover:text-[#1e4fae]">
                Toutes les annonces
              </Link>

              <Link href="/recherche" className="transition hover:text-[#1e4fae]">
                Rechercher un véhicule
              </Link>

              <Link href="/contact" className="transition hover:text-[#1e4fae]">
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
              Professionnels
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/pro/inscription" className="transition hover:text-[#1e4fae]">
                Créer un compte pro
              </Link>

              <Link href="/pro/connexion" className="transition hover:text-[#1e4fae]">
                Connexion pro
              </Link>

              <Link href="/pro/deposer" className="transition hover:text-[#1e4fae]">
                Déposer une annonce
              </Link>

              <Link href="/pro/dashboard" className="transition hover:text-[#1e4fae]">
                Dashboard pro
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
              Informations
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/mentions-legales" className="transition hover:text-[#1e4fae]">
                Mentions légales
              </Link>

              <Link href="/confidentialite" className="transition hover:text-[#1e4fae]">
                Politique de confidentialité
              </Link>

              <Link href="/cgv" className="transition hover:text-[#1e4fae]">
                Conditions générales de vente
              </Link>

              <Link href="/cgu" className="transition hover:text-[#1e4fae]">
                Conditions d’utilisation
              </Link>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-slate-900">
              Aide
            </h3>

            <div className="flex flex-col gap-2">
              <Link href="/aide" className="transition hover:text-[#1e4fae]">
                Centre d’aide
              </Link>

              <Link href="/contact" className="transition hover:text-[#1e4fae]">
                Support
              </Link>

              <Link href="/securite" className="transition hover:text-[#1e4fae]">
                Sécurité
              </Link>

              <Link href="/faq" className="transition hover:text-[#1e4fae]">
                FAQ
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Cars Go Direct</p>

          <div className="flex gap-4">
            <Link href="/admin" className="transition hover:text-[#1e4fae]">
              Admin
            </Link>

            <Link href="/contact" className="transition hover:text-[#1e4fae]">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}