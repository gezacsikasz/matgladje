"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { nextPeriod } from "@/lib/periods";

export async function createNextPeriodAction() {
  await requireAdmin();

  const latest = await prisma.period.findFirst({ orderBy: { num: "desc" } });
  if (!latest) {
    throw new Error("Ingen period finns att utgå ifrån — kör seed-scriptet först.");
  }

  const next = nextPeriod(latest);
  await prisma.period.create({
    data: {
      num: next.num,
      startDatum: next.startDatum,
      slutDatum: next.slutDatum,
      deadlineDatum: next.deadlineDatum,
    },
  });

  revalidatePath("/admin/perioder");
  revalidatePath("/admin");
}
