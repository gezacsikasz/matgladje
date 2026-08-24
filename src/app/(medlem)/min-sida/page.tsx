import { requireHousehold } from "@/lib/dal";
import { householdKE } from "@/lib/ke";
import { fmtDate } from "@/lib/format";

export default async function MinSidaPage() {
  const household = await requireHousehold();
  const ke = householdKE(household.members);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Min sida</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">{household.namn}</h1>
        <p className="mt-1 text-sm opacity-65">Gemenskapare sedan {fmtDate(household.createdAt)}</p>
      </div>

      <div className="flex flex-wrap gap-8 rounded-sm border border-line bg-cellar-2 p-6">
        <Stat value={household.members.length} label="personer i hushållet" />
        <Stat value={ke.toFixed(2)} label="konsumtionsenheter (KE)" />
      </div>

      <p className="text-sm opacity-60">
        Historik och delningar med andra gemenskapare kommer hit så småningom.
      </p>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div>
      <div className="font-serif text-2xl text-gold">{value}</div>
      <div className="text-xs opacity-65">{label}</div>
    </div>
  );
}
