import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { fmtKr, fmtDateRange } from "@/lib/format";

async function sumOrderLines(periodId: string | undefined) {
  if (!periodId) return 0;
  const lines = await prisma.orderLine.findMany({
    where: { periodId },
    select: { mangd: true, prisVidKoptillfalle: true },
  });
  return lines.reduce((sum, l) => sum + l.mangd * l.prisVidKoptillfalle, 0);
}

export default async function AdminDashboardPage() {
  const [householdCount, memberCount, producerPipeline, { current, next }] = await Promise.all([
    prisma.household.count(),
    prisma.householdMember.count(),
    prisma.producer.groupBy({ by: ["status"], _count: true }),
    getCurrentAndNextPeriod(),
  ]);

  const [currentSum, nextSum] = await Promise.all([
    sumOrderLines(current?.id),
    sumOrderLines(next?.id),
  ]);

  const pipelineByStatus = Object.fromEntries(
    producerPipeline.map((p) => [p.status, p._count])
  ) as Record<string, number>;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-gold">Översikt</p>
        <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">Hej!</h1>
      </div>

      <div className="flex flex-wrap gap-10 border-t border-line pt-6">
        <Stat value={householdCount} label="Hushåll" />
        <Stat value={memberCount} label="Personer totalt" />
        <Stat value={pipelineByStatus.GODKAND ?? 0} label="Godkända producenter" />
        <Stat value={pipelineByStatus.KANDIDAT ?? 0} label="Producentkandidater" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PeriodCard
          title="Innevarande period"
          period={current}
          sum={currentSum}
        />
        <PeriodCard title="Nästa period" period={next} sum={nextSum} />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <div className="font-serif text-3xl text-gold">{value}</div>
      <div className="max-w-[20ch] text-xs opacity-70">{label}</div>
    </div>
  );
}

function PeriodCard({
  title,
  period,
  sum,
}: {
  title: string;
  period: { num: number; startDatum: Date; slutDatum: Date; deadlineDatum: Date } | null;
  sum: number;
}) {
  return (
    <div className="rounded-sm border border-line bg-cellar-2 p-6">
      <p className="font-mono text-xs uppercase tracking-widest text-gold">{title}</p>
      {period ? (
        <>
          <p className="mt-2 font-serif text-xl">
            Period {period.num} · {fmtDateRange(period.startDatum, period.slutDatum)}
          </p>
          <p className="mt-1 text-xs opacity-60">
            Beställningsdeadline {fmtDateRange(period.deadlineDatum, period.deadlineDatum)}
          </p>
          <p className="mt-4 font-mono text-2xl text-gold">{fmtKr(sum)}</p>
          <p className="text-xs opacity-60">beställt totalt</p>
        </>
      ) : (
        <p className="mt-2 text-sm opacity-70">
          Ingen period skapad än — gå till Perioder för att skapa en.
        </p>
      )}
    </div>
  );
}
