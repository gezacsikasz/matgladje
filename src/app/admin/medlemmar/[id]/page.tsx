import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { keKoefficient, householdKE } from "@/lib/ke";
import { fmtDate, fmtDateRange, fmtKr } from "@/lib/format";

export default async function HouseholdDetailPage({
  params,
}: PageProps<"/admin/medlemmar/[id]">) {
  const { id } = await params;
  const household = await prisma.household.findUnique({
    where: { id },
    include: {
      members: true,
      orderLines: {
        include: { product: true, producer: true, period: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!household) notFound();

  const linesByPeriod = new Map<string, typeof household.orderLines>();
  for (const line of household.orderLines) {
    const key = line.period.id;
    const arr = linesByPeriod.get(key) ?? [];
    arr.push(line);
    linesByPeriod.set(key, arr);
  }
  const periods = [...linesByPeriod.entries()]
    .map(([, lines]) => ({ period: lines[0].period, lines }))
    .sort((a, b) => b.period.num - a.period.num);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/medlemmar" className="text-xs uppercase tracking-wide text-gold">
          ← Alla hushåll
        </Link>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-paper">{household.namn}</h1>
        <p className="mt-1 text-sm opacity-70">
          {household.epost}
          {household.mobil && <> · {household.mobil}</>}
          {household.adress && <> · {household.adress}</>}
        </p>
        <p className="mt-1 text-xs opacity-50">Medlem sedan {fmtDate(household.createdAt)}</p>
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg">
          Personer <span className="font-mono text-sm text-gold">({household.members.length})</span>
        </h2>
        <table className="w-full max-w-md border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide opacity-60">
              <th className="py-2 pr-4 font-normal">Namn</th>
              <th className="py-2 pr-4 font-normal">Ålder</th>
              <th className="py-2 pr-4 font-normal">KE</th>
            </tr>
          </thead>
          <tbody>
            {household.members.map((m) => (
              <tr key={m.id} className="border-b border-line/60">
                <td className="py-2 pr-4">{m.namn || "—"}</td>
                <td className="py-2 pr-4">{m.alder}</td>
                <td className="py-2 pr-4 font-mono text-gold">{keKoefficient(m.alder).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2 pr-4 font-medium">Summa</td>
              <td className="py-2 pr-4" />
              <td className="py-2 pr-4 font-mono font-bold text-gold">
                {householdKE(household.members).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="mb-3 font-serif text-lg">Inköpshistorik</h2>
        {periods.length === 0 ? (
          <p className="text-sm opacity-60">Inga beställningar registrerade än.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {periods.map(({ period, lines }) => {
              const total = lines.reduce((s, l) => s + l.mangd * l.prisVidKoptillfalle, 0);
              return (
                <div key={period.id}>
                  <p className="font-mono text-xs uppercase tracking-wide text-gold">
                    Period {period.num} · {fmtDateRange(period.startDatum, period.slutDatum)}
                  </p>
                  <table className="mt-2 w-full border-collapse text-sm">
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.id} className="border-t border-line/60">
                          <td className="py-2 pr-4">{l.product.namn}</td>
                          <td className="py-2 pr-4 text-xs opacity-60">{l.producer.namn}</td>
                          <td className="py-2 pr-4 font-mono">
                            {l.mangd} {l.product.enhet}
                          </td>
                          <td className="py-2 pr-4 font-mono text-right">
                            {fmtKr(l.mangd * l.prisVidKoptillfalle)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t border-line font-bold">
                        <td className="py-2 pr-4" colSpan={3}>
                          Summa
                        </td>
                        <td className="py-2 pr-4 text-right font-mono text-gold">{fmtKr(total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
