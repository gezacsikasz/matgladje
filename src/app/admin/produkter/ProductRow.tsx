"use client";

import { useActionState, useState } from "react";
import { updateProductAction, type UpdateProductState } from "@/lib/actions/products";

const initialState: UpdateProductState = {};

type Product = {
  id: string;
  namn: string;
  enhet: string;
  malpris: number;
  sakerhet: string | null;
  sourcingStatus: string | null;
  sourcingNote: string | null;
  producenter: { producer: { namn: string } }[];
};

export function ProductRow({ product }: { product: Product }) {
  const [editing, setEditing] = useState(false);
  const action = updateProductAction.bind(null, product.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (editing) {
    return (
      <form
        action={formAction}
        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-t border-line/60 py-2 text-sm"
      >
        <input
          name="namn"
          defaultValue={product.namn}
          className="rounded-sm border border-line bg-cellar px-2 py-1 text-paper outline-none focus:border-gold"
        />
        <input
          name="enhet"
          defaultValue={product.enhet}
          className="w-24 rounded-sm border border-line bg-cellar px-2 py-1 text-paper outline-none focus:border-gold"
        />
        <input
          name="malpris"
          type="number"
          step="0.01"
          defaultValue={product.malpris}
          className="w-24 rounded-sm border border-line bg-cellar px-2 py-1 text-paper outline-none focus:border-gold"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-gold px-2.5 py-1 text-xs font-bold text-ink disabled:opacity-60"
          >
            Spara
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-xs text-paper/60 hover:text-paper"
          >
            Avbryt
          </button>
        </div>
        {state.error && <p className="col-span-4 text-xs text-rust">{state.error}</p>}
      </form>
    );
  }

  const producerNames = product.producenter.map((pp) => pp.producer.namn);

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 border-t border-line/60 py-2 text-sm">
      <div>
        <p>{product.namn}</p>
        {producerNames.length > 0 ? (
          <p className="text-xs opacity-60">{producerNames.join(", ")}</p>
        ) : (
          <p className="text-xs italic text-gold/80">{product.sourcingStatus ?? "Ingen producent länkad"}</p>
        )}
      </div>
      <span className="text-xs opacity-70">{product.enhet}</span>
      <span className="font-mono text-gold">{product.malpris} kr</span>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="text-xs uppercase tracking-wide text-paper/60 hover:text-gold"
      >
        Redigera
      </button>
    </div>
  );
}
