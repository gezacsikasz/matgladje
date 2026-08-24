// Rabattmodell — se MATGLADJE_HANDOVER.md avsnitt 3 och 7 (trösklar/nivåer
// är antaganden, inte verifierade med producenter än).
export const DISCOUNT_TIERS = [
  { min: 0, discount: 0, label: "Ingen rabatt än" },
  { min: 5000, discount: 0.1, label: "Nivå 1 — 10%" },
  { min: 10000, discount: 0.13, label: "Nivå 2 — 13%" },
  { min: 20000, discount: 0.15, label: "Nivå 3 — 15%" },
] as const;

export type DiscountTier = (typeof DISCOUNT_TIERS)[number];

/** Matglädje mål-pris är satt så att det motsvarar 85% av "baspriset" (jfr prototyp). */
export function basePrice(malpris: number): number {
  return malpris / 0.85;
}

export function tierForPool(pool: number): DiscountTier {
  let tier: DiscountTier = DISCOUNT_TIERS[0];
  for (const t of DISCOUNT_TIERS) {
    if (pool >= t.min) tier = t;
  }
  return tier;
}

export function nextTier(pool: number): DiscountTier | null {
  return DISCOUNT_TIERS.find((t) => t.min > pool) ?? null;
}

/** Aktuellt pris för en produkt hos en producent, givet producentens pott denna period. */
export function priceForProduct(malpris: number, pool: number): number {
  return basePrice(malpris) * (1 - tierForPool(pool).discount);
}
