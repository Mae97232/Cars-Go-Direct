"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mergeGuestFavoritesToAccount } from "@/lib/favorites/mergeGuestFavorites";

export default function PostLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let cancelled = false;

    async function run() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/connexion");
        return;
      }

      await mergeGuestFavoritesToAccount(user.id);

      if (!cancelled) {
        router.replace("/compte");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [router, supabase]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-xl items-center justify-center px-4">
      <div className="rounded-[28px] border border-[#e4ddd4] bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
        <p className="text-sm text-slate-600">
          Finalisation de votre connexion...
        </p>
      </div>
    </div>
  );
}