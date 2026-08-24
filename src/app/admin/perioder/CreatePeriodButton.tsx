"use client";

import { useTransition } from "react";
import { createNextPeriodAction } from "@/lib/actions/periods";

export function CreatePeriodButton() {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => createNextPeriodAction())}
      className="rounded-sm bg-gold px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#d8ac4c] disabled:opacity-60"
    >
      {pending ? "Skapar…" : "Skapa nästa period"}
    </button>
  );
}
