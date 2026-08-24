"use client";

import { useTransition } from "react";
import { removeOrderLineAction } from "@/lib/actions/orders";

export function RemoveLineButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => removeOrderLineAction(id))}
      className="text-xs text-paper/40 hover:text-rust disabled:opacity-50"
      title="Ta bort raden"
    >
      {pending ? "…" : "✕"}
    </button>
  );
}
