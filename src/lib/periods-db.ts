import "server-only";
import { prisma } from "@/lib/prisma";

export async function getCurrentPeriod() {
  const now = new Date();
  return prisma.period.findFirst({
    where: { startDatum: { lte: now }, slutDatum: { gte: now } },
    orderBy: { num: "desc" },
  });
}

export async function getCurrentAndNextPeriod() {
  const current = await getCurrentPeriod();
  if (!current) return { current: null, next: null };
  const next = await prisma.period.findUnique({ where: { num: current.num + 1 } });
  return { current, next };
}

/** Summa (mängd × pris vid köptillfälle) för en enskild producent+period. */
export async function getProducerPool(producerId: string, periodId: string): Promise<number> {
  const lines = await prisma.orderLine.findMany({
    where: { producerId, periodId },
    select: { mangd: true, prisVidKoptillfalle: true },
  });
  return lines.reduce((sum, l) => sum + l.mangd * l.prisVidKoptillfalle, 0);
}

/**
 * Summa (mängd × pris vid köptillfälle) per producent för en given period —
 * beräknas färskt från OrderLine varje gång (ingen materialiserad pott, se
 * MATGLADJE_HANDOVER.md avsnitt 5: rimligt vid den här skalan).
 */
export async function getProducerPoolsForPeriod(periodId: string): Promise<Map<string, number>> {
  const lines = await prisma.orderLine.findMany({
    where: { periodId },
    select: { producerId: true, mangd: true, prisVidKoptillfalle: true },
  });
  const pools = new Map<string, number>();
  for (const line of lines) {
    const current = pools.get(line.producerId) ?? 0;
    pools.set(line.producerId, current + line.mangd * line.prisVidKoptillfalle);
  }
  return pools;
}
