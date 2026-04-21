import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/slices/uiSlice";
import { selectTheme } from "../store/selectors";
import { PageHeader, Card } from "../components/common";
import Navigation from "../components/layout/Navigation";
import { Sun, Moon, Globe } from "lucide-react";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);

  return (
    <div className="animate-fade-in">
      <Navigation />
      <PageHeader title="Settings" subtitle="Application preferences and configuration" />

      <div className="max-w-xl space-y-4">
        <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Appearance</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">Theme</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Switch between light and dark mode</p>
            </div>
            <button
              onClick={() => dispatch(toggleTheme())}
              className={`relative inline-flex h-9 w-16 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${theme === "dark" ? "bg-primary-600" : "bg-slate-200"}`}
            >
              <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200 ${theme === "dark" ? "translate-x-8" : "translate-x-1"}`}>
                {theme === "dark" ? <Moon size={14} className="text-primary-600" /> : <Sun size={14} className="text-slate-500" />}
              </span>
            </button>
          </div>
        </Card>

        {/* <Card>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">API Configuration</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Base URL</label>
              <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <Globe size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400 truncate">
                  {process.env.REACT_APP_BASE_URL}
                </span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">Endpoint</label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  /ProgressMonitoring/GetBarcodeTimes
                </span>
              </div>
            </div>
          </div>
        </Card> */}
      </div>
    </div>
  );
};

export default SettingsPage;
