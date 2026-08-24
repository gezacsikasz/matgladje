// Konsumtionsenhet (KE) per åldersgrupp — se MATGLADJE_HANDOVER.md avsnitt 3.
const KE_BRACKETS: { max: number; koefficient: number }[] = [
  { max: 3, koefficient: 0.2 },
  { max: 10, koefficient: 0.5 },
  { max: 17, koefficient: 0.75 },
  { max: 64, koefficient: 1.0 },
  { max: Infinity, koefficient: 0.85 },
];

export function keKoefficient(alder: number): number {
  const bracket = KE_BRACKETS.find((b) => alder <= b.max);
  return bracket ? bracket.koefficient : 0.85;
}

export function householdKE(members: { alder: number }[]): number {
  return members.reduce((sum, m) => sum + keKoefficient(m.alder), 0);
}
