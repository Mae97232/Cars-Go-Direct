import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isPro = false;
  let unreadMessagesCount = 0;
  let proAccountId: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    isPro = profile?.role === "pro";

    if (isPro) {
      const { data: proAccount } = await supabase
        .from("pro_accounts")
        .select("id")
        .eq("profile_id", user.id)
        .maybeSingle();

      proAccountId = proAccount?.id ?? null;

      if (proAccountId) {
        const { data: proConversations } = await supabase
          .from("conversations")
          .select("pro_unread_count")
          .eq("garage_id", proAccountId);

        unreadMessagesCount = (proConversations ?? []).reduce(
          (sum, conversation) => sum + (conversation.pro_unread_count ?? 0),
          0
        );
      }
    } else {
      const { data: buyerConversations } = await supabase
        .from("conversations")
        .select("buyer_unread_count")
        .eq("buyer_email", user.email ?? "");

      unreadMessagesCount = (buyerConversations ?? []).reduce(
        (sum, conversation) => sum + (conversation.buyer_unread_count ?? 0),
        0
      );
    }
  }

  function MessagesBadge() {
    if (unreadMessagesCount <= 0) return null;

    return (
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-orange-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">
        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
      </span>
    );
  }

  const desktopLinkClass =
    "inline-flex h-10 items-center rounded-md px-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900";

  const desktopInlineBadgeLinkClass =
    "inline-flex h-10 items-center gap-2 rounded-md px-3 text-[14px] font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900";

  const mobileLinkClass =
    "shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-900";

  const ctaClass =
    "inline-flex h-11 items-center justify-center rounded-md bg-orange-500 px-4 text-[14px] font-semibold text-white transition hover:bg-orange-600 sm:px-5";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
      <div className="container-app">
        <div className="flex min-h-[74px] items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="flex h-[48px] w-[48px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                <img
                  src="/logo-cargodirect.jpg"
                  alt="Cars Go Direct"
                  className="h-full w-full object-cover"
                />
              </span>

              <div className="min-w-0">
                <span className="block truncate text-[18px] font-semibold text-slate-900">
                  Cars Go Direct
                </span>
                <span className="hidden text-xs text-slate-500 sm:block">
                  Marketplace auto pro
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              <Link href="/annonces" className={desktopLinkClass}>
                Annonces
              </Link>

              <Link href="/recherche" className={desktopLinkClass}>
                Rechercher
              </Link>

              <Link href="/compte/favoris" className={desktopLinkClass}>
                Favoris
              </Link>

              {!user ? (
                <>
                  <Link href="/connexion" className={desktopLinkClass}>
                    Connexion
                  </Link>

                  <Link href="/inscription" className={desktopLinkClass}>
                    Inscription
                  </Link>

                  <Link href="/pro/connexion" className={desktopLinkClass}>
                    Espace pro
                  </Link>
                </>
              ) : isPro ? (
                <>
                  <Link href="/pro/dashboard" className={desktopLinkClass}>
                    Dashboard
                  </Link>

                  <Link
                    href="/pro/messages"
                    className={desktopInlineBadgeLinkClass}
                  >
                    <span>Messages</span>
                    <MessagesBadge />
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/compte" className={desktopLinkClass}>
                    Mon compte
                  </Link>

                  <Link
                    href="/messages"
                    className={desktopInlineBadgeLinkClass}
                  >
                    <span>Messages</span>
                    <MessagesBadge />
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {user ? (
              <>
                <LogoutButton className="hidden h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-[14px] font-medium text-slate-700 transition hover:bg-slate-50 lg:inline-flex" />

                {isPro ? (
                  <Link href="/pro/deposer" className={ctaClass}>
                    <span className="hidden sm:inline">Déposer une annonce</span>
                    <span className="sm:hidden">Déposer</span>
                  </Link>
                ) : (
                  <Link
                    href="/compte/favoris"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50 sm:hidden"
                  >
                    Favoris
                  </Link>
                )}
              </>
            ) : (
              <Link href="/pro/inscription" className={ctaClass}>
                <span className="hidden sm:inline">Déposer une annonce</span>
                <span className="sm:hidden">Déposer</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-white xl:hidden">
        <div className="container-app">
          <div className="flex gap-2 overflow-x-auto py-2.5 [scrollbar-width:none]">
            <Link href="/annonces" className={mobileLinkClass}>
              Annonces
            </Link>

            <Link href="/recherche" className={mobileLinkClass}>
              Rechercher
            </Link>

            <Link href="/compte/favoris" className={mobileLinkClass}>
              Favoris
            </Link>

            {user && isPro ? (
              <>
                <Link href="/pro/dashboard" className={mobileLinkClass}>
                  Dashboard
                </Link>

                <Link
                  href="/pro/messages"
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50" />
              </>
            ) : user ? (
              <>
                <Link href="/compte" className={mobileLinkClass}>
                  Mon compte
                </Link>

                <Link
                  href="/messages"
                  className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-[13px] font-medium text-slate-700 transition hover:bg-slate-50" />
              </>
            ) : (
              <>
                <Link href="/connexion" className={mobileLinkClass}>
                  Connexion
                </Link>

                <Link href="/inscription" className={mobileLinkClass}>
                  Inscription
                </Link>

                <Link href="/pro/connexion" className={mobileLinkClass}>
                  Espace pro
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}