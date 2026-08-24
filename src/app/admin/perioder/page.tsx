import { prisma } from "@/lib/prisma";
import { fmtDateRange, fmtDate, fmtKr } from "@/lib/format";
import { CreatePeriodButton } from "./CreatePeriodButton";

export default async function PerioderPage() {
  const periods = await prisma.period.findMany({
    orderBy: { num: "desc" },
    include: { orderLines: { select: { mangd: true, prisVidKoptillfalle: true } } },
  });
  const now = new Date();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-gold">Perioder</p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-paper">
            Rullande 2-veckorsperioder
          </h1>
          <p className="mt-2 max-w-2xl text-sm opacity-75">
            Periodlängd och deadline (periodslut minus 3 dagar) är antaganden från
            behovsmodellen, inte stämda av med producenter än.
          </p>
        </div>
        <CreatePeriodButton />
      </div>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide opacity-60">
            <th className="py-2 pr-4 font-normal">Period</th>
            <th className="py-2 pr-4 font-normal">Datumintervall</th>
            <th className="py-2 pr-4 font-normal">Deadline</th>
            <th className="py-2 pr-4 font-normal text-right">Beställt totalt</th>
          </tr>
        </thead>
        <tbody>
          {periods.map((p) => {
            const isCurrent = p.startDatum <= now && now <= p.slutDatum;
            const sum = p.orderLines.reduce((s, l) => s + l.mangd * l.prisVidKoptillfalle, 0);
            return (
              <tr key={p.id} className="border-b border-line/60">
                <td className="py-3 pr-4">
                  <span className="font-medium">Period {p.num}</span>
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-bold uppercase text-ink">
                      Nu
                    </span>
                  )}
                </td>
                <td className="py-3 pr-4">{fmtDateRange(p.startDatum, p.slutDatum)}</td>
                <td className="py-3 pr-4 text-xs opacity-70">{fmtDate(p.deadlineDatum)}</td>
                <td className="py-3 pr-4 text-right font-mono text-gold">{fmtKr(sum)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
