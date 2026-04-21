import React, { useEffect, useState } from "react";
import Card from "../../common/Card";
import Modal from "../../common/Modal";
import { barcodeService } from "../../../services/barcodeService";

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

const EmployeeStrip = ({ records = [] }) => {
  const [apiEmployees, setApiEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

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
  const employees = apiEmployees.slice(0, 20);

  const openTasksFor = async (employee) => {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
    setTasks([]);
    setTasksError(null);
    setTasksLoading(true);
    try {
      const set = await barcodeService.getTaskDetails(employee?.Service_No);
      setTasks(set || []);
    } catch (e) {
      console.error("Failed to load tasks", e);
      setTasksError("Failed to load tasks");
    } finally {
      setTasksLoading(false);
    }
  };

  if (employees.length === 0) return null;

  return (
    <Card className="mb-4 overflow-hidden" padding={false}>
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Team Members
        </h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          {employees.length} employees
        </span>
      </div>
      <div className="px-4 py-3 flex items-center gap-4 overflow-x-auto scrollbar-thin">
        {employees.map((emp) => {
          const name = emp?.Name || "";
          const online = isOnline(name, records);
          const [from, to] = getAvatarColor(name);
          const initials = getInitials(name);
          const shortName = name.split(" ")[0];
          return (
            <div
              key={emp?.Service_No || name}
              onClick={() => openTasksFor(emp)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              {/* Avatar container */}
              <div className="relative">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-105 transition-transform duration-200 ring-2 ring-white dark:ring-slate-800"
                  style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  {initials}
                </div>
                {/* Online indicator - TikTok style green dot top-right */}
                <span
                  className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                    online ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-slate-400"
                  }`}
                />
              </div>
              {/* Name */}
              <span className="text-xs text-slate-600 dark:text-slate-400 truncate max-w-[52px] text-center leading-tight">
                {shortName}
              </span>
            </div>
          );
        })}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEmployee(null);
          setTasks([]);
          setTasksError(null);
        }}
        title={selectedEmployee ? `${selectedEmployee.Name} — Tasks` : "Tasks"}
        size="lg"
      >
        {tasksLoading ? (
          <div className="text-sm text-slate-500">Loading tasks…</div>
        ) : tasksError ? (
          <div className="text-sm text-red-500">{tasksError}</div>
        ) : tasks.length === 0 ? (
          <div className="text-sm text-slate-500">No tasks found.</div>
        ) : (
          <div className="space-y-3">
            {tasks.map((t, i) => (
              <div key={i} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.Task}</div>
                  <div className="text-xs text-slate-500">{t.Status || "-"}</div>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  <div>Job Type: {t.JobType || "-"} — Ref: {t.ReferenceNo || "-"}</div>
                  <div>Planned: {t.PlannedStartDate || "-"} → {t.PlannedCompletionDate || "-"}</div>
                  <div>Hours: {t.HoursTaken || "0"}/{t.HoursAllocated || "-"}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default EmployeeStrip;
