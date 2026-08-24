import "server-only";
import { cookies } from "next/headers";

export type PeriodKey = "current" | "next";
export const PERIOD_COOKIE = "matgladje_period";

export async function getSelectedPeriodKey(): Promise<PeriodKey> {
  const store = await cookies();
  return store.get(PERIOD_COOKIE)?.value === "next" ? "next" : "current";
}
