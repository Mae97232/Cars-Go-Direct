"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminProActions({ proId }: { proId: string }) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const router = useRouter();

  async function updateStatus(action: "approve" | "reject") {
    setLoading(action);

    try {
      const res = await fetch("/api/admin/pro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: proId,
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
        onClick={() => updateStatus("reject")}
        disabled={loading !== null}
      >
        {loading === "reject" ? "Refus..." : "Refuser"}
      </button>
    </div>
  );
}