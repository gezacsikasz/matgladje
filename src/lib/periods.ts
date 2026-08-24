// Rullande 2-veckorsperioder — samma logik som prototypen (matgladje_app.html).
// Se MATGLADJE_HANDOVER.md avsnitt 3 och 7 (periodlängd/deadline är antaganden,
// inte verifierade med producenter än).
const DAY_MS = 24 * 60 * 60 * 1000;
export const PERIOD_LENGTH_DAYS = 14;
export const ORDER_LEAD_DAYS = 3;
export const PERIOD_ANCHOR = new Date(Date.UTC(2026, 0, 5));

export type PeriodDates = {
  num: number;
  startDatum: Date;
  slutDatum: Date;
  deadlineDatum: Date;
};

function periodFromIndex(idx: number): PeriodDates {
  const start = new Date(PERIOD_ANCHOR.getTime() + idx * PERIOD_LENGTH_DAYS * DAY_MS);
  const slut = new Date(start.getTime() + (PERIOD_LENGTH_DAYS - 1) * DAY_MS);
  const deadline = new Date(start.getTime() + (PERIOD_LENGTH_DAYS - 1 - ORDER_LEAD_DAYS) * DAY_MS);
  return { num: idx + 1, startDatum: start, slutDatum: slut, deadlineDatum: deadline };
}

/** Perioden som täcker `date` (offset 0), eller en period `offset` steg bort. */
export function periodForDate(date: Date, offset = 0): PeriodDates {
  const diffDays = Math.floor((date.getTime() - PERIOD_ANCHOR.getTime()) / DAY_MS);
  const idx = Math.floor(diffDays / PERIOD_LENGTH_DAYS) + offset;
  return periodFromIndex(idx);
}

/** Nästa period efter en given period (num+1, start = förra slutDatum + 1 dag). */
export function nextPeriod(prev: { num: number; slutDatum: Date }): PeriodDates {
  const start = new Date(prev.slutDatum.getTime() + DAY_MS);
  const slut = new Date(start.getTime() + (PERIOD_LENGTH_DAYS - 1) * DAY_MS);
  const deadline = new Date(start.getTime() + (PERIOD_LENGTH_DAYS - 1 - ORDER_LEAD_DAYS) * DAY_MS);
  return { num: prev.num + 1, startDatum: start, slutDatum: slut, deadlineDatum: deadline };
}
