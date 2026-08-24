import { requireHousehold } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod } from "@/lib/periods-db";
import { householdKE } from "@/lib/ke";
import { fmtDate } from "@/lib/format";
import { PlateChart } from "./PlateChart";

export default async function MinSidaPage() {
  const household = await requireHousehold();
  const { current } = await getCurrentAndNextPeriod();
  const ke = householdKE(household.members);

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { behov: true },
  });

  const currentLines = current
    ? await prisma.orderLine.findMany({
        where: { householdId: household.id, periodId: current.id },
        select: { mangd: true, prisVidKoptillfalle: true, product: { select: { categoryId: true } } },
      })
    : [];

  const breakdown = new Map<string, number>();
  for (const l of currentLines) {
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
      </div>

      <div className="rounded-sm border border-line bg-cellar-2 p-6">
        <h2 className="font-serif text-lg text-paper">Översikt beställning i nuvarande period</h2>
        <p className="mt-1 text-xs opacity-65">
          Här ser du vad ni har beställt i varje kategori, jämfört med ett ungefärligt behov.
        </p>
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
