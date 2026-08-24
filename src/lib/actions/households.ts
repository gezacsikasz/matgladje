"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const memberSchema = z.object({
  namn: z.string().trim().optional(),
  alder: z.coerce.number().int().min(0).max(120),
});

const signupSchema = z.object({
  token: z.string().min(1),
  namn: z.string().trim().min(1, "Ange ett namn för hushållet."),
  adress: z.string().trim().optional(),
  epost: z.string().trim().email("Ogiltig e-postadress."),
  mobil: z.string().trim().optional(),
  password: z.string().min(8, "Lösenordet måste vara minst 8 tecken."),
  members: z.array(memberSchema).min(1, "Lägg till minst en person i hushållet."),
});

export type RedeemInviteState = { error?: string };

export async function redeemInviteAction(
  _prevState: RedeemInviteState,
  formData: FormData
): Promise<RedeemInviteState> {
  const membersRaw = formData.get("membersJson");
  let members: unknown = [];
  try {
    members = JSON.parse(typeof membersRaw === "string" ? membersRaw : "[]");
  } catch {
    return { error: "Ogiltig medlemslista." };
  }

  const parsed = signupSchema.safeParse({
    token: formData.get("token"),
    namn: formData.get("namn"),
    adress: formData.get("adress"),
    epost: formData.get("epost"),
    mobil: formData.get("mobil"),
    password: formData.get("password"),
    members,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formuläret kunde inte sparas." };
  }

  const { token, namn, adress, epost, mobil, password, members: parsedMembers } = parsed.data;

  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || invite.usedAt || (invite.expiresAt && invite.expiresAt < new Date())) {
    return { error: "Inbjudningslänken är ogiltig eller har redan använts." };
  }

  const existingUser = await prisma.user.findUnique({ where: { email: epost } });
  if (existingUser) {
    return { error: "Det finns redan ett konto med den e-postadressen." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const household = await tx.household.create({
      data: {
        namn,
        adress: adress || null,
        epost,
        mobil: mobil || null,
        members: {
          create: parsedMembers.map((m) => ({ namn: m.namn || null, alder: m.alder })),
        },
      },
    });
    await tx.user.create({
      data: { email: epost, passwordHash, role: "MEDLEM", householdId: household.id },
    });
    await tx.inviteToken.update({ where: { id: invite.id }, data: { usedAt: new Date() } });
  });

  redirect("/logga-in?valkommen=1");
}
