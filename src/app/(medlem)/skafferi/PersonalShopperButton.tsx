"use client";

import { useTransition } from "react";
import { runPersonalShopperAction } from "@/lib/actions/orders";
import type { PeriodKey } from "@/lib/period-selection";

export function PersonalShopperButton({ periodKey }: { periodKey: PeriodKey }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => runPersonalShopperAction(periodKey))}
      className="shrink-0 rounded-sm bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-[#d8ac4c] disabled:opacity-60"
    >
      {pending ? "Fyller på…" : "Fyll min period-korg"}
    </button>
  );
}
