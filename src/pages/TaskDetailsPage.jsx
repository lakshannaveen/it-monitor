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
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-right text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <div className="font-medium text-slate-700 dark:text-slate-300">Service No: {serviceNo}</div>
          {availability && String(availability.Status || "").toLowerCase().includes("available") && (
            <div className="mt-1 text-xs">
              <div>In: {formatTime(availability.InTime)}</div>
              <div>Out: {availability.OutTime ? formatTime(availability.OutTime) : "-"}</div>
            </div>
          )}
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
          <div className="space-y-4">
            {tasks.map((t, i) => (
              <article
                key={i}
                className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <h2 className="text-lg font-semibold leading-snug text-slate-900 dark:text-slate-100 sm:pr-4">
                    {t.Task || "Untitled task"}
                  </h2>
                  <div className="text-xs sm:shrink-0">
                    {t.Status ? (
                      <Badge label={t.Status} color={getStatusColor(t.Status)} className="font-semibold" />
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                        -
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Job Type</div>
                    <div className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{t.JobType || "-"}</div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Reference</div>
                    <div className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">{t.ReferenceNo || "-"}</div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60 sm:col-span-2">
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Planned</div>
                    <div className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                      {t.PlannedStartDate || "-"} -&gt; {t.PlannedCompletionDate || "-"}
                    </div>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60 sm:col-span-2">
                    <div className="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500">Hours</div>
                    <div className="mt-0.5 font-medium text-slate-700 dark:text-slate-200">
                      {t.HoursTaken || "0"} / {t.HoursAllocated || "-"}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskDetailsPage;
