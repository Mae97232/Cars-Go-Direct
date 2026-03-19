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

  return (
    <header className="sticky top-0 z-50 border-b border-blue-800/30 bg-blue-700 text-white shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
      <div className="container-app">
        <div className="flex min-h-[68px] items-center justify-between gap-3 py-3 sm:min-h-[72px]">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-extrabold text-blue-700 shadow-sm sm:h-10 sm:w-10">
                CGD
              </span>

              <div className="min-w-0">
                <span className="block truncate text-[14px] font-semibold tracking-tight text-white sm:text-[16px]">
                  Cars Go Direct
                </span>
                <span className="hidden text-xs text-blue-100 sm:block">
                  Marketplace auto pro
                </span>
              </div>
            </Link>

            <nav className="hidden items-center gap-1 xl:flex">
              <Link
                href="/annonces"
                className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
              >
                Annonces
              </Link>

              <Link
                href="/recherche"
                className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
              >
                Rechercher
              </Link>

              {!user ? (
                <>
                  <Link
                    href="/connexion"
                    className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
                  >
                    Connexion
                  </Link>

                  <Link
                    href="/inscription"
                    className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
                  >
                    Inscription
                  </Link>
                </>
              ) : isPro ? (
                <>
                  <Link
                    href="/pro/dashboard"
                    className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
                  >
                    Dashboard
                  </Link>

                  <Link
                    href="/pro/messages"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
                  >
                    <span>Messages</span>
                    <MessagesBadge />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/compte"
                    className="rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
                  >
                    Mon compte
                  </Link>

                  <Link
                    href="/messages"
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-[14px] font-medium text-blue-50 transition hover:bg-white/12 hover:text-white"
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
                <LogoutButton className="hidden rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-[14px] font-medium text-white transition hover:bg-white/20 lg:inline-flex" />

                {isPro ? (
                  <Link
                    href="/pro/deposer"
                    className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[13px] font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-5 sm:text-[14px]"
                  >
                    <span className="hidden sm:inline">Déposer une annonce</span>
                    <span className="sm:hidden">Déposer</span>
                  </Link>
                ) : user ? (
                  <Link
                    href="/compte"
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-3 text-[13px] font-medium text-white transition hover:bg-white/20 sm:hidden"
                  >
                    Compte
                  </Link>
                ) : null}
              </>
            ) : (
              <Link
                href="/pro/inscription"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-white px-4 text-[13px] font-semibold text-blue-700 transition hover:bg-blue-50 sm:px-5 sm:text-[14px]"
              >
                <span className="hidden sm:inline">Déposer une annonce</span>
                <span className="sm:hidden">Déposer</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-white xl:hidden">
        <div className="container-app">
          <div className="flex gap-2 overflow-x-auto py-2.5 [scrollbar-width:none]">
            <Link
              href="/annonces"
              className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
            >
              Annonces
            </Link>

            <Link
              href="/recherche"
              className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
            >
              Rechercher
            </Link>

            {user && isPro ? (
              <>
                <Link
                  href="/pro/dashboard"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  Dashboard
                </Link>

                <Link
                  href="/pro/messages"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700" />
              </>
            ) : user ? (
              <>
                <Link
                  href="/compte"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  Mon compte
                </Link>

                <Link
                  href="/messages"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  <span>Messages</span>
                  <MessagesBadge />
                </Link>

                <LogoutButton className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700" />
              </>
            ) : (
              <>
                <Link
                  href="/connexion"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  Connexion
                </Link>

                <Link
                  href="/inscription"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
                  Inscription
                </Link>

                <Link
                  href="/pro/connexion"
                  className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-2 text-[13px] font-medium text-blue-700"
                >
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