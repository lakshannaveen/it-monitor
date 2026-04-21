import React, { useEffect, useMemo, useState } from "react";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import { barcodeService } from "../../../services/barcodeService";
import { formatDuration } from "../../../utils/formatters";

// Generate a consistent color avatar for a name
const getAvatarColor = (name = "") => {
  const colors = [
    ["#3b82f6", "#1d4ed8"], // blue
    ["#8b5cf6", "#6d28d9"], // violet
    ["#06b6d4", "#0891b2"], // cyan
    ["#10b981", "#059669"], // emerald
    ["#f59e0b", "#d97706"], // amber
    ["#ef4444", "#dc2626"], // red
    ["#ec4899", "#db2777"], // pink
    ["#6366f1", "#4f46e5"], // indigo
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Deterministically decide "online" status – employees with recent activity are online
const isOnline = (name, records) => {
  const today = new Date();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return records.some((r) => {
    const match =
      r.requester?.toLowerCase().includes(name.split(" ")[0]?.toLowerCase()) ||
      r.officer?.toLowerCase().includes(name.split(" ")[0]?.toLowerCase());
    if (!match) return false;
    const diff = today - new Date(r.ictdate);
    return diff <= threeDays;
  });
};

const getTaskStatusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (!s) return "slate";
  if (s.includes("complete") || s.includes("done")) return "green";
  if (s.includes("progress") || s.includes("active") || s.includes("ongoing")) return "blue";
  if (s.includes("hold")) return "purple";
  if (s.includes("pending") || s.includes("queue")) return "yellow";
  if (s.includes("cancel") || s.includes("reject") || s.includes("fail")) return "red";
  return "slate";
};

const CAROUSEL_MS = 30 * 1000; // auto-advance every 30 seconds
const TASK_REFRESH_MS = 30 * 1000;

const EmployeeStrip = ({ records = [] }) => {
  const [apiEmployees, setApiEmployees] = useState([]);
  const [imgStatus, setImgStatus] = useState({});
  const [availability, setAvailability] = useState({});
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [tasksByEmployee, setTasksByEmployee] = useState({});
  const [tasksLoading, setTasksLoading] = useState({});
  const [tasksError, setTasksError] = useState({});

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const names = await barcodeService.getITOEmployees();
        if (mounted) setApiEmployees(names || []);
      } catch (e) {
        console.warn("Failed to load API employees", e);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  // Use API-provided employees only (no record-derived names)
  const employees = useMemo(() => apiEmployees.slice(0, 20), [apiEmployees]);

  const activeEmployee = employees[selectedIndex] || null;
  const activeServiceNo = activeEmployee?.Service_No;
  const activeTasks = activeServiceNo ? tasksByEmployee[activeServiceNo] || [] : [];
  const activeTaskLoading = activeServiceNo ? Boolean(tasksLoading[activeServiceNo]) : false;
  const activeTaskError = activeServiceNo ? tasksError[activeServiceNo] : null;

  useEffect(() => {
    if (employees.length === 0) return;
    if (selectedIndex > employees.length - 1) {
      setSelectedIndex(0);
    }
  }, [employees, selectedIndex]);

  useEffect(() => {
    if (employees.length <= 1) return;
    const timer = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % employees.length);
    }, CAROUSEL_MS);
    return () => clearInterval(timer);
  }, [employees.length]);

  // Fetch availability for displayed employees
  useEffect(() => {
    let mounted = true;
    const loadAvailability = async () => {
      try {
        const entries = await Promise.all(
          employees.map(async (emp) => {
            const svc = emp?.Service_No;
            if (!svc) return [svc, null];
            const res = await barcodeService.getAvailability(svc);
            const status = (res && res.Status) || "";
            const isAvail = String(status).toLowerCase().includes("available");
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
    return () => (mounted = false);
  }, [employees]);

  // Load tasks for the active employee and refresh periodically.
  // Important: depend only on `activeServiceNo` to avoid refetch loops when
  // `tasksByEmployee` state is updated inside this effect.
  useEffect(() => {
    let mounted = true;
    const loadTasks = async ({ force = false } = {}) => {
      if (!activeServiceNo) return;
      if (!force && tasksByEmployee[activeServiceNo]) return;
      setTasksLoading((prev) => ({ ...prev, [activeServiceNo]: true }));
      setTasksError((prev) => ({ ...prev, [activeServiceNo]: null }));
      try {
        const set = await barcodeService.getTaskDetails(activeServiceNo);
        if (!mounted) return;
        setTasksByEmployee((prev) => ({ ...prev, [activeServiceNo]: set || [] }));
      } catch (e) {
        console.warn("Failed to load employee tasks", e);
        if (!mounted) return;
        setTasksError((prev) => ({ ...prev, [activeServiceNo]: "Failed to load tasks" }));
      } finally {
        if (!mounted) return;
        setTasksLoading((prev) => ({ ...prev, [activeServiceNo]: false }));
      }
    };

    // initial load: allow cache to be used when present
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
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Team Members
        </h3>
        <div className="text-right">
          <p className="text-xs text-slate-400 dark:text-slate-500">{employees.length} employees</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">Auto carousel every 30 seconds</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {employees.map((emp, idx) => {
          const name = emp?.Name || "";
          const svc = emp?.Service_No;
          const isActive = selectedIndex === idx;
          const isAvailable = availability.hasOwnProperty(svc) ? availability[svc] : isOnline(name, records);
          return (
            <button
              key={svc || name}
              onClick={() => setSelectedIndex(idx)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-400" : "bg-slate-400"}`} />
              {name}
            </button>
          );
        })}
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50/70 dark:bg-slate-900/40">
          {activeEmployee && (() => {
            const name = activeEmployee?.Name || "";
            const [from, to] = getAvatarColor(name);
            const initials = getInitials(name);
            const svc = activeEmployee?.Service_No;
            const imgUrl = svc ? barcodeService.getUserImageUrl(svc) : null;
            const loaded = imgStatus[svc] === true;
            const isAvailable = availability.hasOwnProperty(svc) ? availability[svc] : isOnline(name, records);
            return (
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className="w-28 h-28 rounded-2xl overflow-hidden relative shadow-md ring-2 ring-white dark:ring-slate-800"
                    style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {imgUrl && (
                      <img
                        src={imgUrl}
                        alt={name}
                        onLoad={() => setImgStatus((s) => ({ ...s, [svc]: true }))}
                        onError={() => setImgStatus((s) => ({ ...s, [svc]: false }))}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{ opacity: imgStatus[svc] === true ? 1 : 0, transition: "opacity 300ms ease-in-out" }}
                      />
                    )}
                    <div className={`w-full h-full flex items-center justify-center text-white text-2xl font-bold`} style={{ opacity: imgStatus[svc] === true ? 0 : 1, transition: "opacity 300ms ease-in-out" }}>
                      {initials}
                    </div>
                  </div>
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${
                      isAvailable ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-slate-400"
                    }`}
                  />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">{name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{svc || "No service number"}</p>
                <p className={`mt-2 text-xs font-medium ${isAvailable ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                  {isAvailable ? "Available now" : "Not available"}
                </p>
              </div>
            );
          })()}
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Tasks</h4>
            <span className="text-xs text-slate-400 dark:text-slate-500">{activeTasks.length} items</span>
          </div>

          <div className="relative">
            <div className="px-4 py-4">
              <div className="max-h-[360px] min-h-[120px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {activeTasks.length === 0 && !activeTaskError ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-400 dark:text-slate-500">No tasks found.</div>
                ) : activeTaskError ? (
                  <div className="px-4 py-8 text-center text-sm text-red-500">{activeTaskError}</div>
                ) : (
                  activeTasks.map((task, index) => (
                    <div key={`${activeServiceNo}-${index}`} className="px-4 py-3">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                        {task.Task || "Untitled task"}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Badge label={task.Status || "-"} color={getTaskStatusColor(task.Status)} />
                        <Badge label={task.JobType || "-"} color={task.JobType === "Hardware" ? "blue" : task.JobType === "Software" ? "indigo" : "slate"} />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDuration(task.HoursTaken || 0)} / {task.HoursAllocated || "-"}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                        Ref: {task.ReferenceNo || "-"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {activeTaskLoading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center pointer-events-none">
                <div className="text-sm text-slate-600 dark:text-slate-300">Loading tasks...</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeStrip;
