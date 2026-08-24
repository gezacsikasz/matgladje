import { fmtKr } from "@/lib/format";

type Category = { id: string; namn: string };

export function PlateChart({
  categories,
  breakdown,
  referens,
  size = 200,
}: {
  categories: Category[];
  breakdown: Map<string, number>;
  referens: Map<string, number>;
  size?: number;
}) {
  const cx = 110;
  const cy = 110;
  const minR = 15;
  const maxR = 92;
  const n = categories.length || 1;
  const step = 360 / n;

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 220 220" width={size} height={size} className="shrink-0">
        <circle cx={110} cy={110} r={92} fill="none" stroke="#F1E7CE" strokeWidth={1} opacity={0.15} />
        {categories.map((cat, i) => {
          const val = breakdown.get(cat.id) ?? 0;
          const target = referens.get(cat.id) || 1;
          const pct = Math.min(val / target, 1);
          const r = val > 0 ? minR + (maxR - minR) * pct : minR * 0.55;
          const a0 = ((i * step - 90) * Math.PI) / 180;
          const a1 = (((i + 1) * step - 90) * Math.PI) / 180;
          const x0 = (cx + r * Math.cos(a0)).toFixed(1);
          const y0 = (cy + r * Math.sin(a0)).toFixed(1);
          const x1 = (cx + r * Math.cos(a1)).toFixed(1);
          const y1 = (cy + r * Math.sin(a1)).toFixed(1);
          const largeArc = step > 180 ? 1 : 0;
          const op = val > 0 ? 0.88 : 0.16;
          const pctLabel = Math.round(pct * 100);
          const tooltip = `${cat.namn}: ${val > 0 ? fmtKr(val) : "0 kr"} beställt (${pctLabel}% av ungefärligt behov)`;
          return (
            <path
              key={cat.id}
              d={`M${cx},${cy} L${x0},${y0} A${r.toFixed(1)},${r.toFixed(1)} 0 ${largeArc} 1 ${x1},${y1} Z`}
              fill="#C89B3C"
              fillOpacity={op}
              stroke="#1F2A1E"
              strokeWidth={1}
            >
              <title>{tooltip}</title>
            </path>
          );
        })}
        <circle cx={110} cy={110} r={6} fill="#1F2A1E" />
      </svg>
      <div className="grid flex-1 grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
        {categories.map((cat) => {
          const val = breakdown.get(cat.id) ?? 0;
          const target = referens.get(cat.id) || 1;
          const pct = Math.round(Math.min(val / target, 1) * 100);
          return (
            <div
              key={cat.id}
              className={`flex justify-between border-b border-line/40 py-1 text-xs ${val > 0 ? "" : "opacity-40"}`}
            >
              <span className="opacity-90">{cat.namn}</span>
              <span className="font-mono text-gold">{val > 0 ? `${fmtKr(val)} · ${pct}%` : "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
