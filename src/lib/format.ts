export function fmtKr(n: number): string {
  return Math.round(n).toLocaleString("sv-SE") + " kr";
}

const MONTHS_SV = [
  "jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec",
];

export function fmtDate(d: Date): string {
  return `${d.getDate()} ${MONTHS_SV[d.getMonth()]} ${d.getFullYear()}`;
}

export function fmtDateRange(start: Date, end: Date): string {
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_SV[start.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS_SV[start.getMonth()]} – ${end.getDate()} ${MONTHS_SV[end.getMonth()]}`;
}
