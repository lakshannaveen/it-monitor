import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const crumbMap = {
  "":        "Dashboard",
  barcode:   "Barcode Times",
  reports:   "Reports",
  settings:  "Settings",
};

const Navigation = () => {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-5">
      <Link to="/" className="flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
        <Home size={14} />
        <span>Home</span>
      </Link>
      {parts.map((part, idx) => (
        <React.Fragment key={part}>
          <ChevronRight size={14} className="opacity-50" />
          <span className={idx === parts.length - 1 ? "text-slate-900 dark:text-slate-100 font-medium" : "hover:text-primary-600"}>
            {crumbMap[part] || part}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Navigation;
