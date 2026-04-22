import React, { useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { LayoutDashboard, Layers, BarChart2, Settings, ChevronRight, X, PanelLeftClose } from "lucide-react";
import { selectSidebarOpen } from "../../store/selectors";
import { setSidebarOpen } from "../../store/slices/uiSlice";

const navItems = [
  { to: "/",         icon: LayoutDashboard, label: "Dashboard"     },
  { to: "/barcode",  icon: Layers,          label: "Barcode Times" },
  { to: "/reports",  icon: BarChart2,        label: "Reports"       },
  { to: "/settings", icon: Settings,         label: "Settings"      },
];

const Sidebar = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectSidebarOpen);
  const location = useLocation();

  // Close on route change for mobile
  useEffect(() => {
    if (window.innerWidth < 1024) dispatch(setSidebarOpen(false));
  }, [location.pathname, dispatch]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") dispatch(setSidebarOpen(false)); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [dispatch]);

  const close = () => dispatch(setSidebarOpen(false));

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 w-64 flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:top-16 lg:z-20 lg:shadow-none
        `}
      >
        {/* Desktop quick close */}
        <div className="hidden lg:flex justify-end px-2 pt-2">
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close sidebar"
            title="Close sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {/* Mobile-only top bar inside drawer */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">ICT</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">Progress Monitor</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">CDL System</p>
            </div>
          </div>
          <button
            onClick={close}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 dark:hover:text-slate-200 transition-colors"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          <ul className="space-y-0.5 px-2">
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === "/"}
                  onClick={() => { if (window.innerWidth < 1024) close(); }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                    }
                  `}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="flex-1 truncate">{label}</span>
                  <ChevronRight size={14} className="opacity-30" />
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-600">ICT Progress Monitor</p>
          <p className="text-xs text-slate-300 dark:text-slate-700 mt-0.5">v1.0.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
