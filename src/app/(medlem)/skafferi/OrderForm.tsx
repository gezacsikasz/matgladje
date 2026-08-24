"use client";

import { useActionState } from "react";
import { addOrderLineAction, type AddOrderState } from "@/lib/actions/orders";
import type { PeriodKey } from "@/lib/period-selection";

const initialState: AddOrderState = {};

export function OrderForm({
  productProducerId,
  periodKey,
}: {
  productProducerId: string;
  periodKey: PeriodKey;
}) {
  const [state, formAction, pending] = useActionState(addOrderLineAction, initialState);

  return (
    <form action={formAction} className="flex items-center gap-2">
      <input type="hidden" name="productProducerId" value={productProducerId} />
      <input type="hidden" name="periodKey" value={periodKey} />
      <input
        type="number"
        name="mangd"
        min={0}
        step={0.5}
        placeholder="0"
        required
        className="w-16 rounded-sm border border-line bg-cellar px-2 py-1.5 text-center text-sm text-paper outline-none focus:border-gold"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-sage px-3 py-1.5 text-xs font-bold text-paper hover:bg-[#7c8e68] disabled:opacity-60"
      >
        {pending ? "…" : "Lägg till"}
      </button>
      {state.error && <span className="text-xs text-rust">{state.error}</span>}
      {state.ok && <span className="text-xs text-gold">✓</span>}
    </form>
  );
}
