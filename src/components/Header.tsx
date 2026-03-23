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
      <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white shadow-sm">
        {unreadMessagesCount > 99 ? "99+" : unreadMessagesCount}
      </span>
    );
  }

  const desktopLinkClass =
    "rounded-xl px-4 py-2 text-[15px] font-medium text-[#2a2017] transition duration-200 hover:bg-black/6 hover:text-black";

  const desktopInlineBadgeLinkClass =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[15px] font-medium text-[#2a2017] transition duration-200 hover:bg-black/6 hover:text-black";

  const mobileLinkClass =
    "shrink-0 rounded-full border border-[#d6c4a9] bg-[#fffaf2] px-3.5 py-2 text-[13px] font-medium text-[#6f4d1f] transition hover:bg-[#f6ead7]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#d2b07a] bg-[linear-gradient(90deg,#a96d2c_0%,#c88a38_24%,#efc46c_52%,#c98b38_78%,#8d5920_100%)] text-[#20160f] shadow-[0_14px_40px_rgba(44,28,10,0.18)]">
      <div className="container-app">
        <div className="flex min-h-[78px] items-center justify-between gap-3 py-3 sm:min-h-[86px]">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="flex h-[56px] w-[56px] shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[#1a1714] shadow-[0_10px_24px_rgba(0,0,0,0.22)] sm:h-[62px] sm:w-[62px]">
                <img
                  src="/logo-cargodirect.jpg"
                  alt="Cars Go Direct"
                  className="h-full w-full object-cover"
                />
              </span>

              <div className="min-w-0">
                <span className="block truncate text-[17px] font-semibold tracking-[-0.03em] text-[#241912] sm:text-[19px]">
                  Cars Go Direct
                </span>
                <span className="hidden text-xs text-[#4f3923]/85 sm:block">
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
                <LogoutButton className="hidden rounded-xl border border-black/10 bg-white/18 px-4 py-2 text-[14px] font-medium text-[#231912] backdrop-blur-sm transition hover:bg-white/28 lg:inline-flex" />

                {isPro ? (
                  <Link
                    href="/pro/deposer"
                    className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#171311] px-4 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#0f0d0c] sm:px-5 sm:text-[14px]"
                  >
                    <span className="hidden sm:inline">
                      Déposer une annonce
                    </span>
                    <span className="sm:hidden">Déposer</span>
                  </Link>
                ) : (
                  <Link
                    href="/compte/favoris"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-black/10 bg-white/18 px-3 text-[13px] font-medium text-[#231912] transition hover:bg-white/28 sm:hidden"
                  >
                    Favoris
                  </Link>
                )}
              </>
            ) : (
              <Link
                href="/pro/inscription"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-[#171311] px-4 text-[13px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_24px_rgba(0,0,0,0.22)] transition duration-200 hover:bg-[#0f0d0c] sm:px-5 sm:text-[14px]"
              >
                <span className="hidden sm:inline">
                  Déposer une annonce
                </span>
                <span className="sm:hidden">Déposer</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-black/8 bg-[#fffdf9] xl:hidden">
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
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d6c4a9] bg-[#fffaf2] px-3.5 py-2 text-[13px] font-medium text-[#6f4d1f] transition hover:bg-[#f6ead7]"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-full border border-[#d6c4a9] bg-[#fffaf2] px-3.5 py-2 text-[13px] font-medium text-[#6f4d1f] transition hover:bg-[#f6ead7]" />
              </>
            ) : user ? (
              <>
                <Link href="/compte" className={mobileLinkClass}>
                  Mon compte
                </Link>

                <Link
                  href="/messages"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[#d6c4a9] bg-[#fffaf2] px-3.5 py-2 text-[13px] font-medium text-[#6f4d1f] transition hover:bg-[#f6ead7]"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-full border border-[#d6c4a9] bg-[#fffaf2] px-3.5 py-2 text-[13px] font-medium text-[#6f4d1f] transition hover:bg-[#f6ead7]" />
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