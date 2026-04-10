"use client";

import { useTransition } from "react";
import { deleteAd, setAdStatus } from "@/app/admin/action";

type Props = {
  adId: string;
  status: "draft" | "active" | "paused" | "archived";
};

export default function AdminAdActions({ adId, status }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {status !== "active" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => setAdStatus(adId, "active"))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Activer
        </button>
      )}

      {status !== "paused" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => setAdStatus(adId, "paused"))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Pause
        </button>
      )}

      {status !== "archived" && (
        <button
          disabled={pending}
          onClick={() => startTransition(() => setAdStatus(adId, "archived"))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Archiver
        </button>
      )}

      <button
        disabled={pending}
        onClick={() => {
          if (window.confirm("Supprimer cette publicité ?")) {
            startTransition(() => deleteAd(adId));
          }
        }}
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        Supprimer
      </button>
    </div>
  );
}