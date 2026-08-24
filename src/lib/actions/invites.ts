"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const INVITE_VALID_DAYS = 14;

export type CreateInviteState = { error?: string; createdToken?: string };

export async function createInviteAction(
  _prevState: CreateInviteState,
  formData: FormData
): Promise<CreateInviteState> {
  const admin = await requireAdmin();

  const email = (formData.get("email") as string | null)?.trim() || null;
  const householdNameHint = (formData.get("householdNameHint") as string | null)?.trim() || null;

  const token = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + INVITE_VALID_DAYS * 24 * 60 * 60 * 1000);

  await prisma.inviteToken.create({
    data: {
      token,
      email,
      householdNameHint,
      createdByUserId: admin.id,
      expiresAt,
    },
  });

  revalidatePath("/admin/inbjudningar");
  return { createdToken: token };
}

export async function revokeInviteAction(id: string) {
  await requireAdmin();
  await prisma.inviteToken.delete({ where: { id } });
  revalidatePath("/admin/inbjudningar");
}
