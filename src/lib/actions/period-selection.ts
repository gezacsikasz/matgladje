"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { PERIOD_COOKIE, type PeriodKey } from "@/lib/period-selection";

export async function setPeriodAction(period: PeriodKey) {
  const store = await cookies();
  store.set(PERIOD_COOKIE, period, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  revalidatePath("/skafferi");
  revalidatePath("/min-sida");
}
