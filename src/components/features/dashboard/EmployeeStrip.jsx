import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Clock, Monitor } from "lucide-react";
import Card from "../../common/Card";
import StatsCard from "./StatsCard";
import RecentActivity from "./RecentActivity";
import { barcodeService } from "../../../services/barcodeService";

const STATUS_COLORS = {
  InProgress: "#3b82f6",
  Pending: "#8b5cf6",
  TemporaryHold: "#f59e0b",
  Completed: "#10b981",
};

const CAROUSEL_MS = 30 * 1000;
const TASK_REFRESH_MS = 30 * 1000;

const getAvatarColor = (name = "") => {
  const colors = [
    ["#3b82f6", "#1d4ed8"],
    ["#8b5cf6", "#6d28d9"],
    ["#06b6d4", "#0891b2"],
    ["#10b981", "#059669"],
    ["#f59e0b", "#d97706"],
    ["#ef4444", "#dc2626"],
    ["#ec4899", "#db2777"],
    ["#6366f1", "#4f46e5"],
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length <= 1) return (parts[0] || "?").slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const isOnline = (name, records) => {
  const today = new Date();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return records.some((r) => {
    const first = name.split(" ")[0]?.toLowerCase();
    const match = r.requester?.toLowerCase().includes(first) || r.officer?.toLowerCase().includes(first);
    if (!match) return false;
    return today - new Date(r.ictdate) <= threeDays;
  });
};

const detectTaskStatus = (task) => {
  const status = String(task?.Status || "").toLowerCase();
  if (status.includes("progress")) return "InProgress";
  if (status.includes("hold") || status.includes("temporary")) return "TemporaryHold";
  if (status.includes("complete") || status.includes("done") || status.includes("finish")) return "Completed";
  return "Pending";
};

const buildPie = (segments, cx, cy, r) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);
  if (total === 0) return [];
  const slices = [];
  let angle = -Math.PI / 2;
  segments.forEach((seg) => {
    const sweep = (seg.value / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += sweep;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const large = sweep > Math.PI ? 1 : 0;
    slices.push({ ...seg, d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` });
  });
  return slices;
};

const EmployeeStrip = ({ records = [], stats = null }) => {
  const navigate = useNavigate();
  const [apiEmployees, setApiEmployees] = useState([]);
  const [imgStatus, setImgStatus] = useState({});
  const [availability, setAvailability] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tasksByEmployee, setTasksByEmployee] = useState({});
  const [tasksLoading, setTasksLoading] = useState({});

  useEffect(() => {
    let mounted = true;
    const loadEmployees = async () => {
      try {
        const names = await barcodeService.getITOEmployees();
        if (mounted) setApiEmployees(names || []);
      } catch (e) {
        console.warn("Failed to load API employees", e);
      }
    };
    loadEmployees();
    return () => {
      mounted = false;
    };
  }, []);

  const employees = useMemo(() => apiEmployees.slice(0, 20), [apiEmployees]);
  const activeEmployee = employees[selectedIndex] || null;
  const activeServiceNo = activeEmployee?.Service_No;
  const activeTasks = activeServiceNo ? tasksByEmployee[activeServiceNo] || [] : [];

  const activeTaskStatus = useMemo(() => {
    const counts = { InProgress: 0, Pending: 0, TemporaryHold: 0, Completed: 0 };
    activeTasks.forEach((task) => {
      const key = detectTaskStatus(task);
      counts[key]++;
    });
    const segments = Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({ key, value, color: STATUS_COLORS[key] }));
    return {
      counts,
      total: activeTasks.length,
      slices: buildPie(segments, 70, 70, 58),
    };
  }, [activeTasks]);

  useEffect(() => {
    if (employees.length === 0) return;
    if (selectedIndex > employees.length - 1) setSelectedIndex(0);
  }, [employees, selectedIndex]);

  useEffect(() => {
    if (employees.length <= 1) return undefined;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % employees.length);
    }, CAROUSEL_MS);
    return () => clearInterval(timer);
  }, [employees.length]);

  useEffect(() => {
    let mounted = true;
    const loadAvailability = async () => {
      try {
        const entries = await Promise.all(
          employees.map(async (emp) => {
            const svc = emp?.Service_No;
            if (!svc) return [svc, null];
            const res = await barcodeService.getAvailability(svc);
            const isAvail = String((res && res.Status) || "").toLowerCase().includes("available");
            return [svc, isAvail];
          })
        );
        if (!mounted) return;
        const map = {};
        entries.forEach(([svc, val]) => {
          if (svc) map[svc] = Boolean(val);
        });
        setAvailability(map);
      } catch (e) {
        console.warn("Failed to load availability", e);
      }
    };
    if (employees.length > 0) loadAvailability();
    return () => {
      mounted = false;
    };
  }, [employees]);

  useEffect(() => {
    let mounted = true;
    const loadTasks = async ({ force = false } = {}) => {
      if (!activeServiceNo) return;
      if (!force && tasksByEmployee[activeServiceNo]) return;
      setTasksLoading((prev) => ({ ...prev, [activeServiceNo]: true }));
      try {
        const set = await barcodeService.getTaskDetails(activeServiceNo);
        if (!mounted) return;
        setTasksByEmployee((prev) => ({ ...prev, [activeServiceNo]: set || [] }));
      } catch (e) {
        console.warn("Failed to load employee tasks", e);
      } finally {
        if (!mounted) return;
        setTasksLoading((prev) => ({ ...prev, [activeServiceNo]: false }));
      }
    };

    loadTasks({ force: false });
    const refresh = setInterval(() => {
      loadTasks({ force: true });
    }, TASK_REFRESH_MS);

    return () => {
      mounted = false;
      clearInterval(refresh);
    };
  }, [activeServiceNo]);

  if (employees.length === 0) return null;

  return (
    <Card className="mb-4 overflow-hidden" padding={false}>
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team Members</h3>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">{employees.length} employees</p>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {employees.map((emp, idx) => {
          const name = emp?.Name || "";
          const svc = emp?.Service_No;
          const isActive = selectedIndex === idx;
          const isAvailable = Object.prototype.hasOwnProperty.call(availability, svc) ? availability[svc] : isOnline(name, records);
          const imgUrl = svc ? barcodeService.getUserImageUrl(svc) : null;
          const loaded = imgStatus[svc] === true;
          const [from, to] = getAvatarColor(name);
          const initials = getInitials(name);

          return (
            <div
              key={svc || name}
              onClick={() => setSelectedIndex(idx)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedIndex(idx);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              }`}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (svc) navigate(`/tasks/${svc}`, { state: { name } });
                }}
                className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/70 dark:ring-slate-700"
                title={svc ? `Open tasks for ${name}` : name}
              >
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }} />
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt={name}
                    onLoad={() => setImgStatus((s) => ({ ...s, [svc]: true }))}
                    onError={() => setImgStatus((s) => ({ ...s, [svc]: false }))}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms ease-in-out" }}
                  />
                )}
                <span
                  className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-white"
                  style={{ opacity: loaded ? 0 : 1, transition: "opacity 200ms ease-in-out" }}
                >
                  {initials}
                </span>
              </button>
              <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-400" : "bg-slate-400"}`} />
              {name}
            </div>
          );
        })}
      </div>

      {stats && (
        <div className="px-4 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Total Records" value={stats.total} icon={Layers} color="blue" sub="All job types" />
            <StatsCard label="Hardware" value={stats.hardware} icon={Monitor} color="blue" sub="Hardware jobs" />
            <StatsCard label="Software" value={stats.software} icon={Layers} color="indigo" sub="Software jobs" />
            <StatsCard label="Total Hours" value={`${stats.totalHours}h`} icon={Clock} color="sky" sub="Reported hours" />
          </div>
        </div>
      )}

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status Distribution</h4>
            {activeEmployee?.Service_No && (
              <button
                type="button"
                onClick={() => navigate(`/tasks/${activeEmployee.Service_No}`, { state: { name: activeEmployee?.Name || "" } })}
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Open tasks
              </button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative w-[140px] h-[140px]">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="1" className="text-slate-200 dark:text-slate-700" />
                {activeTaskStatus.total === 0 ? (
                  <circle cx="70" cy="70" r="58" className="fill-slate-200 dark:fill-slate-700" />
                ) : (
                  activeTaskStatus.slices.map((slice) => (
                    <path key={slice.key} d={slice.d} fill={slice.color} />
                  ))
                )}
                <circle cx="70" cy="70" r="34" className="fill-white dark:fill-slate-800" />
                <text x="70" y="66" textAnchor="middle" className="fill-slate-800 dark:fill-slate-100" fontSize="18" fontWeight="700">
                  {activeTaskStatus.total}
                </text>
                <text x="70" y="82" textAnchor="middle" className="fill-slate-400" fontSize="9" fontWeight="500">
                  TASKS
                </text>
              </svg>
            </div>

            <div className="flex-1 space-y-1.5">
              {[
                ["InProgress", "In Progress"],
                ["Pending", "Pending"],
                ["TemporaryHold", "Temporary Hold"],
                ["Completed", "Completed"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: STATUS_COLORS[key] }} />
                  <span className="text-xs text-slate-600 dark:text-slate-400 flex-1">{label}</span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{activeTaskStatus.counts[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="min-h-[360px]">
          <RecentActivity records={records} />
        </div>
      </div>
    </Card>
  );
};

export default EmployeeStrip;
