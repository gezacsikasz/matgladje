"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  namn: z.string().trim().min(1),
  enhet: z.string().trim().min(1),
  malpris: z.coerce.number().min(0),
});

export type UpdateProductState = { error?: string; ok?: boolean };

export async function updateProductAction(
  id: string,
  _prevState: UpdateProductState,
  formData: FormData
): Promise<UpdateProductState> {
  await requireAdmin();

  const parsed = updateSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ogiltiga uppgifter." };
  }

  await prisma.product.update({ where: { id }, data: parsed.data });

  revalidatePath("/admin/produkter");
  return { ok: true };
}
