import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-16">
      <div className="mx-auto max-w-6xl px-4 py-12 text-sm text-slate-600">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Plateforme */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Cars Go Direct
            </h3>

            <div className="flex flex-col gap-2">

              <Link href="/" className="hover:text-slate-900">
                Accueil
              </Link>

              <Link href="/annonces" className="hover:text-slate-900">
                Toutes les annonces
              </Link>

              <Link href="/recherche" className="hover:text-slate-900">
                Rechercher un véhicule
              </Link>

              <Link href="/contact" className="hover:text-slate-900">
                Contact
              </Link>

            </div>
          </div>

          {/* Professionnels */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Professionnels
            </h3>

            <div className="flex flex-col gap-2">

              <Link href="/pro/inscription" className="hover:text-slate-900">
                Créer un compte pro
              </Link>

              <Link href="/pro/connexion" className="hover:text-slate-900">
                Connexion pro
              </Link>

              <Link href="/pro/deposer" className="hover:text-slate-900">
                Déposer une annonce
              </Link>

              <Link href="/pro/dashboard" className="hover:text-slate-900">
                Dashboard pro
              </Link>

            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Informations
            </h3>

            <div className="flex flex-col gap-2">

              <Link href="/mentions-legales" className="hover:text-slate-900">
                Mentions légales
              </Link>

              <Link href="/confidentialite" className="hover:text-slate-900">
                Politique de confidentialité
              </Link>

              <Link href="/cgv" className="hover:text-slate-900">
                Conditions générales de vente
              </Link>

              <Link href="/cgu" className="hover:text-slate-900">
                Conditions d’utilisation
              </Link>

            </div>
          </div>

          {/* Aide */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">
              Aide
            </h3>

            <div className="flex flex-col gap-2">

              <Link href="/aide" className="hover:text-slate-900">
                Centre d’aide
              </Link>

              <Link href="/contact" className="hover:text-slate-900">
                Support
              </Link>

              <Link href="/securite" className="hover:text-slate-900">
                Sécurité
              </Link>

              <Link href="/faq" className="hover:text-slate-900">
                FAQ
              </Link>

            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <p>
            © {new Date().getFullYear()} Cars Go Direct
          </p>

          <div className="flex gap-4">

            <Link href="/admin" className="hover:text-slate-900">
              Admin
            </Link>

            <Link href="/contact" className="hover:text-slate-900">
              Support
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
}