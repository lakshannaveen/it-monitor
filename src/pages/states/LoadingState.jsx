import React from "react";

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-4 border-primary-100 dark:border-primary-900" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-600 animate-spin" />
    </div>
    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading data…</p>
  </div>
);

export default LoadingState;
