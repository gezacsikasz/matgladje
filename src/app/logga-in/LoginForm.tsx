"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/actions/auth";

const initialState: LoginState = {};

export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs uppercase tracking-wide text-gold">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="rounded-sm border border-line bg-cellar px-3 py-2.5 text-paper outline-none focus:border-gold"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs uppercase tracking-wide text-gold">
          Lösenord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="rounded-sm border border-line bg-cellar px-3 py-2.5 text-paper outline-none focus:border-gold"
        />
      </div>
      {state.error && <p className="text-sm text-rust">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-gold px-5 py-3 font-bold text-ink transition hover:bg-[#d8ac4c] disabled:opacity-60"
      >
        {pending ? "Loggar in…" : "Logga in"}
      </button>
    </form>
  );
}
