"use client";

import { useTransition } from "react";
import { revokeInviteAction } from "@/lib/actions/invites";

export function RevokeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => revokeInviteAction(id))}
      className="text-xs uppercase tracking-wide text-paper/60 hover:text-rust disabled:opacity-50"
    >
      {pending ? "Tar bort…" : "Återkalla"}
    </button>
  );
}
