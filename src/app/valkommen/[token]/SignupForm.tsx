"use client";

import { useActionState, useState } from "react";
import { redeemInviteAction, type RedeemInviteState } from "@/lib/actions/households";

const initialState: RedeemInviteState = {};

type Member = { namn: string; alder: string };

export function SignupForm({
  token,
  householdNameHint,
  emailHint,
}: {
  token: string;
  householdNameHint: string;
  emailHint: string;
}) {
  const [state, formAction, pending] = useActionState(redeemInviteAction, initialState);
  const [members, setMembers] = useState<Member[]>([{ namn: "", alder: "" }]);

  function updateMember(i: number, field: keyof Member, value: string) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />
      <input
        type="hidden"
        name="membersJson"
        value={JSON.stringify(members.map((m) => ({ namn: m.namn, alder: Number(m.alder) })))}
      />

      <Field label="Hushållets namn" name="namn" defaultValue={householdNameHint} required />
      <Field label="Adress (valfritt)" name="adress" />
      <Field label="E-post" name="epost" type="email" defaultValue={emailHint} required />
      <Field label="Mobil (valfritt)" name="mobil" />
      <Field label="Lösenord (minst 8 tecken)" name="password" type="password" required />

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-gold">Personer i hushållet</p>
        <div className="flex flex-col gap-2">
          {members.map((m, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                placeholder="Namn (valfritt)"
                value={m.namn}
                onChange={(e) => updateMember(i, "namn", e.target.value)}
                className="flex-1 rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
              />
              <input
                placeholder="Ålder"
                type="number"
                min={0}
                max={120}
                required
                value={m.alder}
                onChange={(e) => updateMember(i, "alder", e.target.value)}
                className="w-24 rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
              />
              {members.length > 1 && (
                <button
                  type="button"
                  onClick={() => setMembers((prev) => prev.filter((_, idx) => idx !== i))}
                  className="px-2 text-paper/50 hover:text-rust"
                  aria-label="Ta bort person"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMembers((prev) => [...prev, { namn: "", alder: "" }])}
          className="mt-2 rounded-sm border border-dashed border-line px-3 py-1.5 text-xs text-paper/80 hover:border-gold hover:text-gold"
        >
          + Lägg till person
        </button>
      </div>

      {state.error && <p className="text-sm text-rust">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-sm bg-gold px-5 py-3 font-bold text-ink hover:bg-[#d8ac4c] disabled:opacity-60"
      >
        {pending ? "Skapar konto…" : "Skapa hushåll"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-xs uppercase tracking-wide text-gold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="rounded-sm border border-line bg-cellar px-3 py-2.5 text-paper outline-none focus:border-gold"
      />
    </div>
  );
}
