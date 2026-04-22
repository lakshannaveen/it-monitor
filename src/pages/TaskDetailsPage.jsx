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

  const isCompletedStatus = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("complete") || s.includes("done") || s.includes("finish");
  };

  const isInProgressStatus = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("progress") || s.includes("active") || s.includes("ongoing");
  };

  const getRequestedByName = (value) => {
    const text = String(value || "").trim();
    if (!text) return "-";
    const parts = text.split(" - ");
    return parts.length > 1 ? parts.slice(1).join(" - ").trim() || "-" : text;
  };

  const getRequestedByServiceNo = (value) => {
    const text = String(value || "").trim();
    const match = text.match(/^(\d{4,})\s*-/);
    return match ? match[1] : null;
  };

  const getInitials = (fullName = "") => {
    const parts = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "NA";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  const visibleTasks = tasks.filter((t) => !isCompletedStatus(t.Status));
  const inProgressTasks = visibleTasks.filter((t) => isInProgressStatus(t.Status));
  const otherTasks = visibleTasks.filter((t) => !isInProgressStatus(t.Status));

  const renderTable = (list) => (
    <div className="overflow-x-auto">
      <table className="min-w-full text-lg">
        <thead>
          <tr className="text-left text-base text-slate-500 uppercase tracking-wider">
            <th className="px-4 py-4">Requested By</th>
            <th className="px-4 py-4">Task</th>
            <th className="px-4 py-4 whitespace-nowrap">All Hours</th>
            <th className="px-4 py-4 whitespace-nowrap">Actual Hours</th>
            <th className="px-4 py-4">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {list.map((t, i) => (
            <tr key={i} className="bg-white dark:bg-slate-800">
              <td className="px-4 py-6 align-top text-slate-600 dark:text-slate-300">
                <div className="flex items-start">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-base font-semibold text-slate-600 dark:text-slate-200 shrink-0">
                    {getRequestedByServiceNo(t.RequestedBy) && (
                      <img
                        src={barcodeService.getUserImageUrl(getRequestedByServiceNo(t.RequestedBy))}
                        alt={getRequestedByName(t.RequestedBy)}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <span>{getInitials(getRequestedByName(t.RequestedBy))}</span>
                  </div>
                </div>
              </td>
              <td className="px-4 py-6 align-top">
                <div className="font-medium text-xl leading-8 text-slate-800 dark:text-slate-100">{t.Task || "Untitled task"}</div>
              </td>
              <td className="px-4 py-6 align-top text-slate-700 dark:text-slate-200 whitespace-nowrap tabular-nums font-medium text-xl">
                {t.HoursAllocated || "-"}
              </td>
              <td className="px-4 py-6 align-top text-slate-700 dark:text-slate-200 whitespace-nowrap tabular-nums font-medium text-xl">
                {t.HoursTaken || 0}
              </td>
              <td className="px-4 py-6 align-top text-slate-600 dark:text-slate-300 whitespace-nowrap">
                {t.Status ? <Badge label={t.Status} color={getStatusColor(t.Status)} className="whitespace-nowrap" /> : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="mb-3">
        <p className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {serviceNo} - {name || "Unknown"}
        </p>
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
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
            No tasks found.
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                In Progress
              </h3>
              {inProgressTasks.length > 0 ? (
                renderTable(inProgressTasks)
              ) : (
                <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">No in-progress tasks.</div>
              )}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800">
              <h3 className="px-4 pt-4 pb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                Other Tasks
              </h3>
              {otherTasks.length > 0 ? (
                renderTable(otherTasks)
              ) : (
                <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">No other tasks.</div>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskDetailsPage;
