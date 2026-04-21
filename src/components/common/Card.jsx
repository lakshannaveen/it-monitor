import React from "react";

const Card = ({ children, className = "", padding = true, hover = false }) => (
  <div
    className={`
      bg-white dark:bg-slate-800
      border border-slate-200 dark:border-slate-700
      rounded-xl shadow-sm
      ${padding ? "p-5" : ""}
      ${hover ? "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 cursor-pointer" : ""}
      ${className}
    `}
  >
    {children}
  </div>
);

export default Card;
