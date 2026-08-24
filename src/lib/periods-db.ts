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
