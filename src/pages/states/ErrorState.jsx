import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

const ErrorState = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <div className="p-4 rounded-full bg-red-50 dark:bg-red-900/20">
      <AlertTriangle size={28} className="text-red-500 dark:text-red-400" />
    </div>
    <div>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Failed to load data</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm">{error || "An unexpected error occurred."}</p>
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors"
      >
        <RefreshCw size={15} />
        Retry
      </button>
    )}
  </div>
);

export default ErrorState;
