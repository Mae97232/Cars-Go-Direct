"use client";

import { useTransition } from "react";
import {
  suspendUser,
  reactivateUser,
  softDeleteUser,
  promoteToAdmin,
  removeAdminRights,
} from "@/app/admin/action";

type Props = {
  userId: string;
  isSuspended: boolean;
  isAdmin: boolean;
};

export default function AdminUserActions({
  userId,
  isSuspended,
  isAdmin,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap justify-end gap-2">
      {isSuspended ? (
        <button
          disabled={pending}
          onClick={() => startTransition(() => reactivateUser(userId))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Réactiver
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => suspendUser(userId))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Suspendre
        </button>
      )}

      {isAdmin ? (
        <button
          disabled={pending}
          onClick={() => startTransition(() => removeAdminRights(userId))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Retirer admin
        </button>
      ) : (
        <button
          disabled={pending}
          onClick={() => startTransition(() => promoteToAdmin(userId))}
          className="btn btn-secondary !px-4 !py-2"
        >
          Rendre admin
        </button>
      )}

      <button
        disabled={pending}
        onClick={() => {
          if (window.confirm("Supprimer ce compte ?")) {
            startTransition(() => softDeleteUser(userId));
          }
        }}
        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        Supprimer
      </button>
    </div>
  );
}