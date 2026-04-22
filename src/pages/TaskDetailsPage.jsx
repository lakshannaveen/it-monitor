import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Card from "../components/common/Card";
import Badge from "../components/common/Badge";
import { barcodeService } from "../services/barcodeService";

const TaskDetailsPage = () => {
  const { serviceNo } = useParams();
  const location = useLocation();
  const name = new URLSearchParams(location.search).get("name") || location.state?.name;

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const set = await barcodeService.getTaskDetails(serviceNo);
        if (mounted) setTasks(set || []);
      } catch (e) {
        console.error("Failed to load tasks", e);
        if (mounted) setError("Failed to load tasks");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, [serviceNo]);

  useEffect(() => {
    let mounted = true;
    const loadAvailability = async () => {
      try {
        const av = await barcodeService.getAvailability(serviceNo);
        if (!mounted) return;
        setAvailability(av || null);
      } catch (e) {
        console.warn("Failed to load availability", e);
      }
    };
    if (serviceNo) loadAvailability();
    return () => (mounted = false);
  }, [serviceNo]);

  const formatTime = (s) => {
    if (!s) return "-";
    try {
      const d = new Date(s);
      if (isNaN(d)) return s;
      return d.toLocaleString();
    } catch {
      return s;
    }
  };

  const getInitials = (fullName = "") => {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const isAvailable = String(availability?.Status || "").toLowerCase().includes("available");
  const imageUrl = serviceNo ? barcodeService.getUserImageUrl(serviceNo) : null;
  const displayName = name || serviceNo;

  const getStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (!s) return "slate";
    if (s.includes("complete") || s.includes("done")) return "green";
    if (s.includes("progress") || s.includes("active") || s.includes("ongoing")) return "blue";
    if (s.includes("hold")) return "purple";
    if (s.includes("pending") || s.includes("queue")) return "yellow";
    if (s.includes("cancel") || s.includes("reject") || s.includes("fail")) return "red";
    return "slate";
  };

  const getRequestedByName = (value) => {
    const text = String(value || "").trim();
    if (!text) return "-";
    const parts = text.split(" - ");
    return parts.length > 1 ? parts.slice(1).join(" - ").trim() || "-" : text;
  };

  const inProgressCount = tasks.filter((t) => String(t.Status || "").toLowerCase().includes("progress")).length;
  const pendingCount = tasks.filter((t) => String(t.Status || "").toLowerCase().includes("pending")).length;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Tasks for {name || serviceNo}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Total: {tasks.length}
            </span>
            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800/70 dark:bg-blue-900/30 dark:text-blue-300">
              In Progress: {inProgressCount}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-800/70 dark:bg-amber-900/30 dark:text-amber-300">
              Pending: {pendingCount}
            </span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 min-w-[240px]">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-200">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={displayName}
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgLoaded(false)}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ opacity: imgLoaded ? 1 : 0, transition: "opacity 200ms ease-in-out" }}
                />
              )}
              <span style={{ opacity: imgLoaded ? 0 : 1, transition: "opacity 200ms ease-in-out" }}>
                {getInitials(displayName)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="font-medium text-slate-700 dark:text-slate-300 truncate">Service No: {serviceNo}</div>
              <div className={`text-xs mt-0.5 ${isAvailable ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}>
                {isAvailable ? "Available" : "Not available"}
              </div>
            </div>
          </div>
          <div className="mt-2 text-xs">
            In: {availability?.InTime ? formatTime(availability.InTime) : "-"}
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-b from-white to-slate-50/60 dark:from-slate-900 dark:to-slate-900/70">
        {loading ? (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            Loading tasks...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-8 text-center text-sm text-red-600 dark:border-red-900/70 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No tasks found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Task</th>
                  <th className="px-4 py-3">Requested By</th>
                  <th className="px-4 py-3">Job Type</th>
                  <th className="px-4 py-3">Reference</th>
                  <th className="px-4 py-3">Planned</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((t, i) => (
                  <tr key={i} className="bg-white dark:bg-slate-800">
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{t.Task || "Untitled task"}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">{getRequestedByName(t.RequestedBy)}</td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">{t.JobType || "-"}</td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">{t.ReferenceNo || "-"}</td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">
                      {t.PlannedStartDate || "-"} &rarr; {t.PlannedCompletionDate || "-"}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">{t.HoursTaken || 0} / {t.HoursAllocated || "-"}</td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300">
                      {t.Status ? <Badge label={t.Status} color={getStatusColor(t.Status)} /> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskDetailsPage;
