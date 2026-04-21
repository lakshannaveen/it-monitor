import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../common/Card";
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
  const [imgStatus, setImgStatus] = useState({});
  const [availability, setAvailability] = useState({});
  const navigate = useNavigate();

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

  const openTasksFor = (employee) => {
    // navigate to task details page and include employee name in query
    const name = employee?.Name || "";
    navigate(`/tasks/${employee?.Service_No}?name=${encodeURIComponent(name)}`);
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
          const svc = emp?.Service_No;
          const imgUrl = svc ? barcodeService.getUserImageUrl(svc) : null;
          const loaded = imgStatus[svc] === true;
          const shortName = name.split(" ")[0];
          const isAvailable = availability.hasOwnProperty(svc)
            ? availability[svc]
            : online;
          return (
            <div
              key={emp?.Service_No || name}
              onClick={() => openTasksFor(emp)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
            >
              {/* Avatar container */}
              <div className="relative">
                <div className="w-11 h-11 rounded-full overflow-hidden relative shadow-md group-hover:scale-105 transition-transform duration-200 ring-2 ring-white dark:ring-slate-800" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                  {imgUrl && (
                    <img
                      src={imgUrl}
                      alt={name}
                      onLoad={() => setImgStatus((s) => ({ ...s, [svc]: true }))}
                      onError={() => setImgStatus((s) => ({ ...s, [svc]: false }))}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ display: imgStatus[svc] === false ? "none" : "block" }}
                    />
                  )}
                  {/* Initials shown when image not loaded */}
                  <div className={`w-full h-full flex items-center justify-center text-white text-sm font-bold ${loaded ? "hidden" : "block"}`}>
                    {initials}
                  </div>
                </div>
                {/* Online indicator - TikTok style green dot top-right */}
                <span
                  className={`absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 ${
                    isAvailable ? "bg-green-400 shadow-green-400/50 shadow-sm" : "bg-slate-400"
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
      {/* Navigation to task details page handled on click */}
    </Card>
  );
};

export default EmployeeStrip;
