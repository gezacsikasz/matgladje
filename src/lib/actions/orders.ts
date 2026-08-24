"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireHousehold } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { getCurrentAndNextPeriod, getProducerPool } from "@/lib/periods-db";
import { priceForProduct } from "@/lib/pricing";
import { householdKE } from "@/lib/ke";
import { PERIOD_LENGTH_DAYS } from "@/lib/periods";
import type { PeriodKey } from "@/lib/period-selection";

const addSchema = z.object({
  productProducerId: z.string().min(1),
  mangd: z.coerce.number().positive(),
  periodKey: z.enum(["current", "next"]),
});

export type AddOrderState = { error?: string; ok?: boolean };

export async function addOrderLineAction(
  _prevState: AddOrderState,
  formData: FormData
): Promise<AddOrderState> {
  const household = await requireHousehold();

  const parsed = addSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: "Ange en giltig mängd." };
  }
  const { productProducerId, mangd, periodKey } = parsed.data;

  const { current, next } = await getCurrentAndNextPeriod();
  const period = periodKey === "next" ? next : current;
  if (!period) {
    return { error: "Ingen period att beställa för just nu." };
  }

  const pp = await prisma.productProducer.findUnique({
    where: { id: productProducerId },
    include: { product: true },
  });
  if (!pp) {
    return { error: "Varan hittades inte." };
  }

  const pool = await getProducerPool(pp.producerId, period.id);
  const price = priceForProduct(pp.product.malpris, pool);

  await prisma.orderLine.create({
    data: {
      householdId: household.id,
      periodId: period.id,
      productId: pp.productId,
      producerId: pp.producerId,
      mangd,
      prisVidKoptillfalle: price,
    },
  });

  revalidatePath("/skafferi");
  revalidatePath("/korg");
  revalidatePath("/min-sida");
  return { ok: true };
}

export async function removeOrderLineAction(id: string) {
  const household = await requireHousehold();
  await prisma.orderLine.deleteMany({ where: { id, householdId: household.id } });
  revalidatePath("/skafferi");
  revalidatePath("/korg");
  revalidatePath("/min-sida");
}

function roundQtyForUnit(qty: number, enhet: string): number {
  if (enhet.includes("knippe") || enhet.includes("förp")) return Math.max(1, Math.round(qty));
  return Math.max(0.5, Math.round(qty * 2) / 2);
}

/** Fyller på period-korgen där kategoritäckningen ligger under KE-referensen. */
export async function runPersonalShopperAction(periodKey: PeriodKey) {
  const household = await requireHousehold();
  const { current, next } = await getCurrentAndNextPeriod();
  const period = periodKey === "next" ? next : current;
  if (!period) return;

  const ke = householdKE(household.members);
  const periodFraction = PERIOD_LENGTH_DAYS / 30.44;

  const categories = await prisma.category.findMany({
    include: {
      behov: true,
      products: {
        orderBy: { namn: "asc" },
        include: { producenter: true },
      },
    },
  });

  const existingLines = await prisma.orderLine.findMany({
    where: { householdId: household.id, periodId: period.id },
    include: { product: true },
  });
  const haveByCategory = new Map<string, number>();
  for (const line of existingLines) {
    const key = line.product.categoryId;
    haveByCategory.set(key, (haveByCategory.get(key) ?? 0) + line.mangd * line.prisVidKoptillfalle);
  }

  for (const cat of categories) {
    if (!cat.behov) continue;
    const target = cat.behov.krPerKePerManad * ke * periodFraction;
    const have = haveByCategory.get(cat.id) ?? 0;
    const gap = target - have;
    if (gap <= 5) continue;

    const candidate = cat.products.find((p) => p.producenter.length > 0);
    if (!candidate) continue;
    const producerLink = candidate.producenter[0];

    const pool = await getProducerPool(producerLink.producerId, period.id);
    const price = priceForProduct(candidate.malpris, pool);
    const qty = roundQtyForUnit(gap / price, candidate.enhet);
    if (qty <= 0) continue;

    await prisma.orderLine.create({
      data: {
        householdId: household.id,
        periodId: period.id,
        productId: candidate.id,
        producerId: producerLink.producerId,
        mangd: qty,
        prisVidKoptillfalle: price,
      },
    });
  }

  revalidatePath("/skafferi");
  revalidatePath("/korg");
  revalidatePath("/min-sida");
}
