"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminListingActions({
  listingId,
}: {
  listingId: string;
}) {
  const [loading, setLoading] = useState<"approve" | "hide" | null>(null);
  const router = useRouter();

  async function updateStatus(action: "approve" | "hide") {
    setLoading(action);

    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: listingId,
          action,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Erreur.");
        setLoading(null);
        return;
      }

      router.refresh();
    } catch {
      alert("Erreur réseau.");
    }

    setLoading(null);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn btn-secondary !px-4 !py-2"
        onClick={() => updateStatus("approve")}
        disabled={loading !== null}
      >
        {loading === "approve" ? "Validation..." : "Valider"}
      </button>

      <button
        type="button"
        className="btn btn-secondary !px-4 !py-2"
        onClick={() => updateStatus("hide")}
        disabled={loading !== null}
      >
        {loading === "hide" ? "Masquage..." : "Masquer"}
      </button>
    </div>
  );
}