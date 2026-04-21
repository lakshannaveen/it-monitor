import React, { useMemo } from "react";
import Card from "../../common/Card";

// Simple SVG pie chart — no external chart lib needed
const STATUS_CONFIG = {
  InProgress:    { label: "In Progress",    color: "#3b82f6", bg: "bg-blue-500",   text: "text-blue-600 dark:text-blue-400",   badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  TemporaryHold: { label: "Temporary Hold", color: "#f59e0b", bg: "bg-amber-500",  text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  Pending:       { label: "Pending",        color: "#8b5cf6", bg: "bg-violet-500", text: "text-violet-600 dark:text-violet-400",badge: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  Completed:     { label: "Completed",      color: "#10b981", bg: "bg-emerald-500",text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
};

// Detect status from record fields
const detectStatus = (r) => {
  const s = (r.status || r.jobstatus || "").toLowerCase();
  if (s.includes("inprogress") || s.includes("in progress") || s.includes("progress")) return "InProgress";
  if (s.includes("hold") || s.includes("temporary")) return "TemporaryHold";
  if (s.includes("pending")) return "Pending";
  if (s.includes("complete") || s.includes("done") || s.includes("finish")) return "Completed";
  // Fallback: group by reuhour vs not started
  if (parseFloat(r.reuhour || 0) > 0) return "InProgress";
  return "Pending";
};

// Build SVG pie slices
const buildPie = (data, cx, cy, r) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return [];
  const slices = [];
  let angle = -Math.PI / 2;
  data.forEach((d) => {
    const sweep = (d.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    slices.push({ ...d, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, sweep });
  });
  return slices;
};

const StatusPieChart = ({ records = [] }) => {
  const { counts, slices, total } = useMemo(() => {
    const counts = { InProgress: 0, TemporaryHold: 0, Pending: 0, Completed: 0 };
    records.forEach((r) => { const s = detectStatus(r); counts[s]++; });
    const total = records.length;
    const data = Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({ key, value, color: STATUS_CONFIG[key].color, label: STATUS_CONFIG[key].label }));
    const slices = buildPie(data, 80, 80, 68);
    return { counts, slices, total };
  }, [records]);

  // Dominant status for center label
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];

  return (
    <Card className="h-full">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Status Distribution</h3>

      <div className="flex flex-col items-center gap-4">
        {/* Pie */}
        <div className="relative">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {/* Background circle */}
            <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-100 dark:text-slate-700" />
            {total === 0 ? (
              <circle cx="80" cy="80" r="68" className="fill-slate-100 dark:fill-slate-700" />
            ) : (
              slices.map((s, i) => (
                <path
                  key={i}
                  d={s.d}
                  fill={s.color}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.15))" }}
                />
              ))
            )}
            {/* Inner donut hole */}
            <circle cx="80" cy="80" r="42" className="fill-white dark:fill-slate-800" />
            {/* Center text */}
            <text x="80" y="75" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100" fontSize="22" fontWeight="700">
              {total}
            </text>
            <text x="80" y="92" textAnchor="middle" className="fill-slate-400" fontSize="9" fontWeight="500" letterSpacing="0.5">
              TOTAL
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
            const count = counts[key] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cfg.color }} />
                <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{cfg.label}</span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{count}</span>
                <span className="text-xs text-slate-400 w-8 text-right">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default StatusPieChart;
