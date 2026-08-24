"use client";

import { useActionState, useState } from "react";
import { createInviteAction, type CreateInviteState } from "@/lib/actions/invites";

const initialState: CreateInviteState = {};

export function InviteForm() {
  const [state, formAction, pending] = useActionState(createInviteAction, initialState);
  const [copied, setCopied] = useState(false);

  const link = state.createdToken
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/valkommen/${state.createdToken}`
    : null;

  return (
    <div className="rounded-sm border border-line bg-cellar-2 p-6">
      <form action={formAction} className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="householdNameHint" className="text-xs uppercase tracking-wide text-gold">
            Hushållsnamn (valfritt)
          </label>
          <input
            id="householdNameHint"
            name="householdNameHint"
            className="w-56 rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
            placeholder="Familjen Andersson"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs uppercase tracking-wide text-gold">
            E-post (valfritt)
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="w-64 rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
            placeholder="anna@exempel.se"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-4 py-2.5 text-sm font-bold text-ink hover:bg-[#d8ac4c] disabled:opacity-60"
        >
          {pending ? "Skapar…" : "Skapa inbjudningslänk"}
        </button>
      </form>

      {link && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <code className="break-all rounded-sm bg-cellar px-3 py-2 font-mono text-xs text-paper">
            {link}
          </code>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="rounded-sm border border-line px-3 py-1.5 text-xs uppercase tracking-wide text-paper/80 hover:border-gold hover:text-gold"
          >
            {copied ? "Kopierad!" : "Kopiera"}
          </button>
        </div>
      )}
    </div>
  );
}
