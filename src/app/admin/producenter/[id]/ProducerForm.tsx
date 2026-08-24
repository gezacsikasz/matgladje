"use client";

import { useActionState } from "react";
import type { UpdateProducerState } from "@/lib/actions/producers";

const initialState: UpdateProducerState = {};

type Producer = {
  namn: string;
  region: string | null;
  adress: string | null;
  egenWebb: string | null;
  ansvarigNamn: string | null;
  ansvarigMobil: string | null;
  ansvarigEpost: string | null;
  betalmetod: "SWISH" | "KONTO" | null;
  swishNr: string | null;
  kontoNr: string | null;
  kapacitetKrPerManad: number | null;
  status: "KANDIDAT" | "ANSOKT" | "GODKAND" | "INAKTIV";
};

export function ProducerForm({
  producer,
  action,
}: {
  producer: Producer;
  action: (state: UpdateProducerState, formData: FormData) => Promise<UpdateProducerState>;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Namn" name="namn" defaultValue={producer.namn} required />
        <Field label="Region" name="region" defaultValue={producer.region ?? ""} />
        <Field label="Adress" name="adress" defaultValue={producer.adress ?? ""} />
        <Field label="Egen webb" name="egenWebb" defaultValue={producer.egenWebb ?? ""} />
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-gold">Ansvarig kontaktperson</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Namn" name="ansvarigNamn" defaultValue={producer.ansvarigNamn ?? ""} />
          <Field label="Mobil" name="ansvarigMobil" defaultValue={producer.ansvarigMobil ?? ""} />
          <Field label="E-post" name="ansvarigEpost" defaultValue={producer.ansvarigEpost ?? ""} />
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <p className="mb-3 text-xs uppercase tracking-wide text-gold">
          Betalning (visas för medlemmar — Matglädje hanterar aldrig pengar)
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="betalmetod" className="text-xs uppercase tracking-wide text-gold">
              Betalmetod
            </label>
            <select
              id="betalmetod"
              name="betalmetod"
              defaultValue={producer.betalmetod ?? ""}
              className="rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
            >
              <option value="">Ej angivet</option>
              <option value="SWISH">Swish</option>
              <option value="KONTO">Kontonummer</option>
            </select>
          </div>
          <Field label="Swish-nummer" name="swishNr" defaultValue={producer.swishNr ?? ""} />
          <Field label="Kontonummer" name="kontoNr" defaultValue={producer.kontoNr ?? ""} />
        </div>
      </div>

      <div className="border-t border-line pt-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Kapacitetstak (kr/månad)"
            name="kapacitetKrPerManad"
            type="number"
            defaultValue={producer.kapacitetKrPerManad?.toString() ?? ""}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="text-xs uppercase tracking-wide text-gold">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={producer.status}
              className="rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
            >
              <option value="KANDIDAT">Kandidat</option>
              <option value="ANSOKT">Ansökt</option>
              <option value="GODKAND">Godkänd</option>
              <option value="INAKTIV">Inaktiv</option>
            </select>
          </div>
        </div>
      </div>

      {state.error && <p className="text-sm text-rust">{state.error}</p>}
      {state.ok && <p className="text-sm text-sage">Sparat.</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-sm bg-gold px-5 py-2.5 text-sm font-bold text-ink hover:bg-[#d8ac4c] disabled:opacity-60"
      >
        {pending ? "Sparar…" : "Spara"}
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
        className="rounded-sm border border-line bg-cellar px-3 py-2 text-sm text-paper outline-none focus:border-gold"
      />
    </div>
  );
}
