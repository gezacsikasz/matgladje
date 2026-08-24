import { requireHousehold } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { householdKE } from "@/lib/ke";
import { fmtKr, fmtDate, fmtDateRange } from "@/lib/format";
import { RemoveLineButton } from "./RemoveLineButton";
import { PlateChart } from "./PlateChart";

export default async function KorgPage() {
  const household = await requireHousehold();
  const { current, next } = await getCurrentAndNextPeriod();
  const ke = householdKE(household.members);

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { behov: true },
  });
  const referens = new Map<string, number>();
  for (const cat of categories) {
    referens.set(cat.id, (cat.behov?.krPerKePerManad ?? 0) * ke);
  }

  const periodIds = [current?.id, next?.id].filter((id): id is string => Boolean(id));
  const allLines = periodIds.length
    ? await prisma.orderLine.findMany({
        where: { householdId: household.id, periodId: { in: periodIds } },
        include: { product: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const linesByPeriod = {
    current: allLines.filter((l) => l.periodId === current?.id),
    next: allLines.filter((l) => l.periodId === next?.id),
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Korg</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">
          Din beställning — dina perioder
        </h1>
        <p className="mt-2 max-w-xl text-sm opacity-75">
          Vad ni beställt i varje kategori, och listan med rader. Fel rad? Ta bort den nedan.
        </p>
      </div>

      <PeriodBlock
        label="Denna period"
        period={current}
        lines={linesByPeriod.current}
        categories={categories}
        referens={referens}
      />
      <PeriodBlock
        label="Nästa period"
        period={next}
        lines={linesByPeriod.next}
        categories={categories}
        referens={referens}
      />
    </div>
  );
}

function PeriodBlock({
  label,
  period,
  lines,
  categories,
  referens,
}: {
  label: string;
  period: { num: number; startDatum: Date; slutDatum: Date; deadlineDatum: Date } | null;
  lines: {
    id: string;
    mangd: number;
    prisVidKoptillfalle: number;
    product: { namn: string; enhet: string; categoryId: string; butikReferens: number | null };
  }[];
  categories: { id: string; namn: string }[];
  referens: Map<string, number>;
}) {
  if (!period) return null;

  let total = 0;
  let saveTotal = 0;
  const breakdown = new Map<string, number>();
  for (const l of lines) {
    const lineTotal = l.mangd * l.prisVidKoptillfalle;
    total += lineTotal;
    saveTotal += (l.product.butikReferens ?? 0) * l.mangd - lineTotal;
    const key = l.product.categoryId;
    breakdown.set(key, (breakdown.get(key) ?? 0) + lineTotal);
  }

  return (
    <div className="rounded-sm border border-line bg-cellar-2 p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="font-serif text-xl text-gold">{label}</span>
        <span className="font-mono text-xs opacity-60">period {period.num}</span>
      </div>
      <p className="mt-1 font-serif text-lg text-paper">
        {fmtDateRange(period.startDatum, period.slutDatum)}
      </p>
      <p className="mt-0.5 text-xs opacity-60">beställ senast {fmtDate(period.deadlineDatum)}</p>

      <div className="mt-5 border-t border-line pt-5">
        <PlateChart categories={categories} breakdown={breakdown} referens={referens} size={170} />
      </div>

      <div className="mt-5 border-t border-line pt-4">
        {lines.length === 0 ? (
          <p className="text-sm opacity-60">Inget beställt än för denna period.</p>
        ) : (
          <>
            {lines.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between gap-3 border-t border-line/60 py-2 text-sm first:border-t-0"
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
    </div>
  );
}
