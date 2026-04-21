import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Card from "../components/common/Card";
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

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tasks for {name || serviceNo}</h1>
        <div className="text-sm text-slate-500">Service No: {serviceNo}</div>
      </div>

      <Card>
        {loading ? (
          <div className="text-sm text-slate-500">Loading tasks…</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
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
      </Card>
    </div>
  );
};

export default TaskDetailsPage;
