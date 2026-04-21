import React from "react";

const Table = ({ columns, data, emptyMessage = "No records found." }) => (
  <div className="overflow-x-auto scrollbar-thin">
    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
      <thead>
        <tr className="bg-slate-50 dark:bg-slate-900/50">
          {columns.map((col) => (
            <th
              key={col.key}
              className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="px-4 py-10 text-center text-sm text-slate-400 dark:text-slate-500"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((row, idx) => (
            <tr
              key={idx}
              className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors duration-100"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap"
                >
                  {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;
