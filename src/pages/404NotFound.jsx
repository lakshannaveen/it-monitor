import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
    <p className="text-8xl font-bold text-primary-100 dark:text-primary-900 select-none">404</p>
    <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200 -mt-4">Page not found</h1>
    <p className="text-sm text-slate-500 dark:text-slate-400">The page you're looking for doesn't exist.</p>
    <Link
      to="/"
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors mt-2"
    >
      <Home size={15} />
      Back to Dashboard
    </Link>
  </div>
);

export default NotFoundPage;
