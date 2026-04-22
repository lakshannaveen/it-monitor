import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Sun, Moon, RefreshCw, Bell } from "lucide-react";
import { toggleTheme, toggleSidebar } from "../../store/slices/uiSlice";
import { selectTheme, selectLoading, selectLastFetched, selectSidebarOpen } from "../../store/selectors";
import { fetchBarcodeTimes } from "../../store/slices/barcodeSlice";

const Header = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const loading = useSelector(selectLoading);
  const lastFetched = useSelector(selectLastFetched);
  const sidebarOpen = useSelector(selectSidebarOpen);

  const lastFetchedStr = lastFetched
    ? new Date(lastFetched).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <header className="fixed top-0 left-0 right-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
      {/* Sidebar toggle */}
      <button
        onClick={() => dispatch(toggleSidebar())}
        className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <Menu size={20} />
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-auto">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
          <span className="text-white text-xs font-bold">ICT</span>
        </div>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">Progress Monitor</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">CDL System</p>
        </div>
      </div>

      {/* Last updated */}
      {lastFetchedStr && (
        <span className="hidden md:block text-xs text-slate-400 dark:text-slate-500">
          Updated {lastFetchedStr}
        </span>
      )}

      {/* Refresh */}
      <button
        onClick={() => dispatch(fetchBarcodeTimes())}
        disabled={loading}
        className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:text-slate-400 transition-colors disabled:opacity-50"
        title="Refresh data"
      >
        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
      </button>

      {/* Notification placeholder */}
      <button className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors">
        <Bell size={18} />
      </button>

      {/* Theme toggle */}
      <button
        onClick={() => dispatch(toggleTheme())}
        className="p-2 rounded-lg text-slate-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 dark:text-slate-400 dark:hover:text-primary-400 transition-colors"
        title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      >
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-semibold ml-1">
        AD
      </div>
    </header>
  );
};

export default Header;
