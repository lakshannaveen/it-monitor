import React from "react";

const colorMap = {
  blue: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  sky: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  green: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  red: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  slate: "bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300",
  purple: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

const jobTypeColor = {
  Hardware: "blue",
  Software: "indigo",
  Network: "sky",
  Unknown: "slate",
};

const Badge = ({ label, color, jobType, className = "" }) => {
  const resolvedColor = color || (jobType ? jobTypeColor[jobType] : "slate") || "slate";
  const cls = colorMap[resolvedColor] || colorMap.slate;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls} ${className}`}>
      {label || jobType || "-"}
    </span>
  );
};

export default Badge;
