import React, { useMemo, useState } from "react";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import { formatDate, formatDuration } from "../../../utils/formatters";

// ── Avatar helpers ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["#8b5cf6", "#6d28d9"],
  ["#06b6d4", "#0891b2"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"],
  ["#ec4899", "#db2777"],
  ["#6366f1", "#4f46e5"],
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const Avatar = ({ name, size = "sm" }) => {
  const [from, to] = getAvatarColor(name);
  const initials = getInitials(name);
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {initials}
    </div>
  );
};

// ── Detect in-progress records ──────────────────────────────────────────────
const isInProgress = (r) => {
  const s = (r.status || r.jobstatus || "").toLowerCase();
  if (s.includes("progress") || s.includes("inprogress")) return true;
  if (s.includes("complete") || s.includes("done") || s.includes("pending") || s.includes("hold")) return false;
  return parseFloat(r.reuhour || 0) > 0;
};

const groupByEmployee = (records) => {
  const map = {};
  records.filter(isInProgress).forEach((r) => {
    const name = r.officer || r.requester || "Unknown";
    if (!map[name]) map[name] = [];
    map[name].push(r);
  });
  return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
};

// ── In-Progress Summary panel ───────────────────────────────────────────────
const InProgressSummary = ({ records }) => {
  const groups = useMemo(() => groupByEmployee(records), [records]);
  const [expanded, setExpanded] = useState(null);

  if (groups.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        No in-progress jobs
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {groups.map(([name, jobs]) => {
        const totalHrs = jobs.reduce((s, r) => s + parseFloat(r.reuhour || 0), 0);
        const isOpen = expanded === name;
        return (
          <div key={name}>
            <button
              onClick={() => setExpanded(isOpen ? null : name)}
              className="w-full flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <Avatar name={name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                <p className="text-xs text-slate-400">
                  {jobs.length} job{jobs.length !== 1 ? "s" : ""} · {formatDuration(totalHrs)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Active
                </span>
                <svg
                  className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
            {isOpen && (
              <div className="bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800">
                {jobs.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-8 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0">
                    <Badge jobType={r.jobtype} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1">{r.logdesc || "—"}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{formatDate(r.ictdate)}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDuration(r.reuhour)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── Main component ──────────────────────────────────────────────────────────
const RecentActivity = ({ records }) => {
  const [tab, setTab] = useState("recent");
  const recent = [...records].slice(0, 8);
  const inProgressCount = useMemo(() => records.filter(isInProgress).length, [records]);

  return (
    <Card padding={false} className="h-full flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1">
        <button
          onClick={() => setTab("recent")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            tab === "recent"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Recent Activity
        </button>
        <button
          onClick={() => setTab("inprogress")}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            tab === "inprogress"
              ? "bg-blue-600 text-white shadow-sm"
              : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          In Progress
          {inProgressCount > 0 && (
            <span className={`rounded-full px-1.5 text-xs font-bold ${tab === "inprogress" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"}`}>
              {inProgressCount}
            </span>
          )}
        </button>
      </div>

      {tab === "recent" ? (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 flex-1 overflow-y-auto">
          {recent.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-400">No records</li>
          )}
          {recent.map((r, i) => {
            const name = r.officer || r.requester || "Unknown";
            return (
              <li key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Avatar name={name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.logdesc || "—"}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge jobType={r.jobtype} />
                    <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{name}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{formatDuration(r.reuhour)}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{formatDate(r.ictdate)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <InProgressSummary records={records} />
        </div>
      )}
    </Card>
  );
};

export default RecentActivity;
