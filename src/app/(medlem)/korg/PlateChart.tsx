"use client";

import { useState } from "react";
import { fmtKr } from "@/lib/format";

type Category = { id: string; namn: string };
type Tooltip = { text: string; x: number; y: number };

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const cx = 110;
  const cy = 110;
  const minR = 15;
  const maxR = 92;
  const n = categories.length || 1;
  const step = 360 / n;

  function tooltipFor(cat: Category) {
    const val = breakdown.get(cat.id) ?? 0;
    const target = referens.get(cat.id) || 1;
    const pctLabel = Math.round(Math.min(val / target, 1) * 100);
    return `${cat.namn}: ${val > 0 ? fmtKr(val) : "0 kr"} beställt (${pctLabel}% av ungefärligt behov)`;
  }

  function showTooltip(cat: Category, e: { clientX: number; clientY: number }) {
    setHoveredId(cat.id);
    setTooltip({ text: tooltipFor(cat), x: e.clientX, y: e.clientY });
  }

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
          const isHovered = hoveredId === cat.id;
          const op = val > 0 ? 0.88 : 0.16;
          return (
            <path
              key={cat.id}
              d={`M${cx},${cy} L${x0},${y0} A${r.toFixed(1)},${r.toFixed(1)} 0 ${largeArc} 1 ${x1},${y1} Z`}
              fill="#C89B3C"
              fillOpacity={op}
              stroke={isHovered ? "#F1E7CE" : "#1F2A1E"}
              strokeWidth={isHovered ? 1.8 : 1}
              className="cursor-pointer transition-[stroke,stroke-width] duration-150"
              onMouseEnter={(e) => showTooltip(cat, e)}
              onMouseMove={(e) => showTooltip(cat, e)}
              onMouseLeave={() => {
                setHoveredId(null);
                setTooltip(null);
              }}
            />
          );
        })}
        <circle cx={110} cy={110} r={6} fill="#1F2A1E" />
      </svg>
      <div className="grid flex-1 grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
        {categories.map((cat) => {
          const val = breakdown.get(cat.id) ?? 0;
          const target = referens.get(cat.id) || 1;
          const pct = Math.round(Math.min(val / target, 1) * 100);
          const isHovered = hoveredId === cat.id;
          return (
            <div
              key={cat.id}
              onMouseEnter={(e) => showTooltip(cat, e)}
              onMouseMove={(e) => showTooltip(cat, e)}
              onMouseLeave={() => {
                setHoveredId(null);
                setTooltip(null);
              }}
              className={`flex cursor-default justify-between rounded-sm border-b border-line/40 px-1 py-1 text-xs transition-colors ${
                val > 0 ? "" : "opacity-40"
              } ${isHovered ? "bg-cellar-3" : ""}`}
            >
              <span className="opacity-90">{cat.namn}</span>
              <span className="font-mono text-gold">{val > 0 ? `${fmtKr(val)} · ${pct}%` : "—"}</span>
            </div>
          );
        })}
      </div>
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-[230px] rounded-sm bg-paper px-3 py-2 text-xs leading-snug text-ink shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
