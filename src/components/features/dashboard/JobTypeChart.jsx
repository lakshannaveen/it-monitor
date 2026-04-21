import React from "react";
import Card from "../../common/Card";
import Badge from "../../common/Badge";

const JobTypeChart = ({ grouped }) => {
  const entries = Object.entries(grouped);
  const max = Math.max(...entries.map(([, arr]) => arr.length), 1);

  const colors = {
    Hardware: "bg-blue-500",
    Software: "bg-indigo-500",
    Network:  "bg-sky-500",
    Unknown:  "bg-slate-400",
  };

  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Job Type Distribution</h3>
      <div className="space-y-3">
        {entries.map(([type, records]) => (
          <div key={type}>
            <div className="flex items-center justify-between mb-1">
              <Badge jobType={type} />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{records.length}</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${colors[type] || "bg-slate-400"} transition-all duration-700`}
                style={{ width: `${(records.length / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default JobTypeChart;
