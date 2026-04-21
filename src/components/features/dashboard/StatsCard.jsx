import React from "react";
import Card from "../../common/Card";

const StatsCard = ({ label, value, icon: Icon, color = "blue", sub }) => {
  const colorMap = {
    blue:   "bg-blue-50   dark:bg-blue-900/20   text-blue-600   dark:text-blue-400",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    sky:    "bg-sky-50    dark:bg-sky-900/20    text-sky-600    dark:text-sky-400",
    slate:  "bg-slate-100 dark:bg-slate-700/50  text-slate-600  dark:text-slate-400",
    green:  "bg-green-50  dark:bg-green-900/20  text-green-600  dark:text-green-400",
  };
  return (
    <Card className="animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
          <p className="mt-1.5 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${colorMap[color] || colorMap.blue}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;
