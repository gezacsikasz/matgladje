"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  namn: z.string().trim().min(1),
  region: z.string().trim().optional(),
  adress: z.string().trim().optional(),
  egenWebb: z.string().trim().optional(),
  ansvarigNamn: z.string().trim().optional(),
  ansvarigMobil: z.string().trim().optional(),
  ansvarigEpost: z.string().trim().optional(),
  betalmetod: z.enum(["SWISH", "KONTO", ""]).optional(),
  swishNr: z.string().trim().optional(),
  kontoNr: z.string().trim().optional(),
  kapacitetKrPerManad: z.coerce.number().min(0).optional().or(z.literal("")),
  status: z.enum(["KANDIDAT", "ANSOKT", "GODKAND", "INAKTIV"]),
});

export type UpdateProducerState = { error?: string; ok?: boolean };

export async function updateProducerAction(
  id: string,
  _prevState: UpdateProducerState,
  formData: FormData
): Promise<UpdateProducerState> {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ogiltiga uppgifter." };
  }
  const d = parsed.data;

  await prisma.producer.update({
    where: { id },
    data: {
      namn: d.namn,
      region: d.region || null,
      adress: d.adress || null,
      egenWebb: d.egenWebb || null,
      ansvarigNamn: d.ansvarigNamn || null,
      ansvarigMobil: d.ansvarigMobil || null,
      ansvarigEpost: d.ansvarigEpost || null,
      betalmetod: d.betalmetod || null,
      swishNr: d.swishNr || null,
      kontoNr: d.kontoNr || null,
      kapacitetKrPerManad: d.kapacitetKrPerManad === "" ? null : d.kapacitetKrPerManad,
      status: d.status,
    },
  });

  revalidatePath("/admin/producenter");
  revalidatePath(`/admin/producenter/${id}`);
  return { ok: true };
}
