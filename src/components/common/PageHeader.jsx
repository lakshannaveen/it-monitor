import React from "react";

const PageHeader = ({ title, subtitle, actions }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export default PageHeader;
