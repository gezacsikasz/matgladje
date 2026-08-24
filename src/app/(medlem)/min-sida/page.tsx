import { requireHousehold } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { householdKE } from "@/lib/ke";
import { fmtKr, fmtDate, fmtDateRange } from "@/lib/format";
import { PlateChart } from "./PlateChart";
import { RemoveLineButton } from "./RemoveLineButton";

export default async function MinSidaPage() {
  const household = await requireHousehold();
  const { current, next } = await getCurrentAndNextPeriod();
  const ke = householdKE(household.members);

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { behov: true },
  });

  const periodIds = [current?.id, next?.id].filter((id): id is string => Boolean(id));
  const allLines = periodIds.length
    ? await prisma.orderLine.findMany({
        where: { householdId: household.id, periodId: { in: periodIds } },
        include: { product: true, producer: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const linesByPeriod = {
    current: allLines.filter((l) => l.periodId === current?.id),
    next: allLines.filter((l) => l.periodId === next?.id),
  };

  function totals(lines: typeof allLines) {
    let total = 0;
    let saveTotal = 0;
    for (const l of lines) {
      const lineTotal = l.mangd * l.prisVidKoptillfalle;
      total += lineTotal;
      saveTotal += (l.product.butikReferens ?? 0) * l.mangd - lineTotal;
    }
    return { total, saveTotal };
  }
  const currentTotals = totals(linesByPeriod.current);
  const nextTotals = totals(linesByPeriod.next);

  const breakdown = new Map<string, number>();
  for (const l of linesByPeriod.current) {
    const key = l.product.categoryId;
    breakdown.set(key, (breakdown.get(key) ?? 0) + l.mangd * l.prisVidKoptillfalle);
  }
  const referens = new Map<string, number>();
  for (const cat of categories) {
    referens.set(cat.id, (cat.behov?.krPerKePerManad ?? 0) * ke);
  }

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
        <Stat value={fmtKr(currentTotals.total)} label="i denna period" />
      </div>

      <div className="rounded-sm border border-line bg-cellar-2 p-6">
        <h2 className="font-serif text-lg text-paper">Din beställning — dina perioder</h2>
        <p className="mt-1 text-xs opacity-65">Vilka perioder du har köpt för, och vad de innehåller.</p>
        <div className="mt-5 flex flex-col gap-6">
          <OrderPeriodBlock
            label="Denna period"
            period={current}
            lines={linesByPeriod.current}
            total={currentTotals.total}
            saveTotal={currentTotals.saveTotal}
          />
          <OrderPeriodBlock
            label="Nästa period"
            period={next}
            lines={linesByPeriod.next}
            total={nextTotals.total}
            saveTotal={nextTotals.saveTotal}
          />
        </div>
      </div>

      <div className="rounded-sm border border-line bg-cellar-2 p-6">
        <h2 className="font-serif text-lg text-paper">Översikt beställning i nuvarande period</h2>
        <p className="mt-1 text-xs opacity-65">Här ser du vad ni har beställt i varje kategori.</p>
        <div className="mt-5">
          <PlateChart categories={categories} breakdown={breakdown} referens={referens} />
        </div>
      </div>
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

function OrderPeriodBlock({
  label,
  period,
  lines,
  total,
  saveTotal,
}: {
  label: string;
  period: { num: number; startDatum: Date; slutDatum: Date } | null;
  lines: {
    id: string;
    mangd: number;
    prisVidKoptillfalle: number;
    product: { namn: string; enhet: string };
  }[];
  total: number;
  saveTotal: number;
}) {
  if (!period) return null;
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-serif text-base text-gold">{label}</span>
        <span className="font-mono text-xs opacity-60">
          period {period.num} · {fmtDateRange(period.startDatum, period.slutDatum)}
        </span>
      </div>
      {lines.length === 0 ? (
        <p className="mt-2 text-sm opacity-60">Inget beställt än för denna period.</p>
      ) : (
        <>
          {lines.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-3 border-t border-line/60 py-2 text-sm"
            >
              <span>
                {l.product.namn} — {l.mangd} {l.product.enhet.replace("kr/", "")}
              </span>
              <span className="flex items-center gap-3">
                <span className="font-mono">{fmtKr(l.mangd * l.prisVidKoptillfalle)}</span>
                <RemoveLineButton id={l.id} />
              </span>
            </div>
          ))}
          <div className="mt-2 flex justify-between border-t border-line pt-2 font-bold">
            <span>Totalt</span>
            <span className="font-mono text-gold">{fmtKr(total)}</span>
          </div>
          <div className="flex justify-between text-xs opacity-70">
            <span>Uppskattad besparing mot butik</span>
            <span className="font-mono">{fmtKr(saveTotal)}</span>
          </div>
        </>
      )}
    </div>
  );
}
