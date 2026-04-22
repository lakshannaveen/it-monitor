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

  const getRequestedByName = (value) => {
    const text = String(value || "").trim();
    if (!text) return "-";
    const parts = text.split(" - ");
    return parts.length > 1 ? parts.slice(1).join(" - ").trim() || "-" : text;
  };

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
                  <th className="px-4 py-3 whitespace-nowrap">Planned</th>
                  <th className="px-4 py-3 whitespace-nowrap">Hours</th>
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
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {t.PlannedStartDate || "-"} &rarr; {t.PlannedCompletionDate || "-"}
                    </td>
                    <td className="px-4 py-4 align-top text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                      {t.HoursTaken || 0} / {t.HoursAllocated || "-"}
                    </td>
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
