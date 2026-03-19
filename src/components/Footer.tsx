import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#1d3a9b] bg-[linear-gradient(90deg,#162a72_0%,#234ec9_48%,#6b91ff_100%)] text-white">
      
      <div className="mx-auto max-w-6xl px-4 py-14 text-sm">

        <div className="grid gap-10 md:grid-cols-4">

          {/* Plateforme */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-white">
              Cars Go Direct
            </h3>

            <div className="flex flex-col gap-2 text-white/85">
              <Link href="/" className="transition hover:text-white">
                Accueil
              </Link>

              <Link href="/annonces" className="transition hover:text-white">
                Toutes les annonces
              </Link>

              <Link href="/recherche" className="transition hover:text-white">
                Rechercher un véhicule
              </Link>

              <Link href="/contact" className="transition hover:text-white">
                Contact
              </Link>
            </div>
          </div>

          {/* Professionnels */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-white">
              Professionnels
            </h3>

            <div className="flex flex-col gap-2 text-white/85">
              <Link href="/pro/inscription" className="transition hover:text-white">
                Créer un compte pro
              </Link>

              <Link href="/pro/connexion" className="transition hover:text-white">
                Connexion pro
              </Link>

              <Link href="/pro/deposer" className="transition hover:text-white">
                Déposer une annonce
              </Link>

              <Link href="/pro/dashboard" className="transition hover:text-white">
                Dashboard pro
              </Link>
            </div>
          </div>

          {/* Informations */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-white">
              Informations
            </h3>

            <div className="flex flex-col gap-2 text-white/85">
              <Link href="/mentions-legales" className="transition hover:text-white">
                Mentions légales
              </Link>

              <Link href="/confidentialite" className="transition hover:text-white">
                Politique de confidentialité
              </Link>

              <Link href="/cgv" className="transition hover:text-white">
                Conditions générales de vente
              </Link>

              <Link href="/cgu" className="transition hover:text-white">
                Conditions d’utilisation
              </Link>
            </div>
          </div>

          {/* Aide */}
          <div>
            <h3 className="mb-4 text-[15px] font-semibold text-white">
              Aide
            </h3>

            <div className="flex flex-col gap-2 text-white/85">
              <Link href="/aide" className="transition hover:text-white">
                Centre d’aide
              </Link>

              <Link href="/contact" className="transition hover:text-white">
                Support
              </Link>

              <Link href="/securite" className="transition hover:text-white">
                Sécurité
              </Link>

              <Link href="/faq" className="transition hover:text-white">
                FAQ
              </Link>
            </div>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between text-white/70">

          <p>
            © {new Date().getFullYear()} Cars Go Direct
          </p>

          <div className="flex gap-4">
            <Link href="/admin" className="transition hover:text-white">
              Admin
            </Link>

            <Link href="/contact" className="transition hover:text-white">
              Support
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}