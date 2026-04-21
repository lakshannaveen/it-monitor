import React from "react";
import { useSelector } from "react-redux";
import { selectStats, selectGroupedByJobType } from "../store/selectors";
import { PageHeader, Card, Badge } from "../components/common";
import Navigation from "../components/layout/Navigation";
import { formatDuration } from "../utils/formatters";

const ReportsPage = () => {
  const stats = useSelector(selectStats);
  const grouped = useSelector(selectGroupedByJobType);

  const rows = Object.entries(grouped).map(([type, records]) => ({
    type,
    count: records.length,
    hours: records.reduce((s, r) => s + parseFloat(r.reuhour || 0), 0),
    pct: stats.total ? ((records.length / stats.total) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="animate-fade-in">
      <Navigation />
      <PageHeader title="Reports" subtitle="Summary breakdown of ICT job activity" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Job Type Summary</h3>
          <div className="space-y-3">
            {rows.map((r) => (
              <div key={r.type} className="flex items-center gap-3">
                <Badge jobType={r.type} className="w-24 justify-center" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{r.count} records</span>
                    <span>{r.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-700"
                      style={{ width: `${r.pct}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 w-14 text-right">
                  {formatDuration(r.hours)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Totals</h3>
          <dl className="space-y-3">
            {[
              { label: "Total Records",    value: stats.total },
              { label: "Total Hours",      value: `${stats.totalHours} hrs` },
              { label: "Hardware Jobs",    value: stats.hardware },
              { label: "Software Jobs",    value: stats.software },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
                <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;
