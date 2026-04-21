import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveJobType } from "../../../store/slices/uiSlice";
import { selectJobTypes, selectActiveJobType } from "../../../store/selectors";

const FilterBar = () => {
  const dispatch = useDispatch();
  const jobTypes = useSelector(selectJobTypes);
  const active = useSelector(selectActiveJobType);

  return (
    <div className="flex flex-wrap gap-2">
      {jobTypes.map((jt) => (
        <button
          key={jt}
          onClick={() => dispatch(setActiveJobType(jt))}
          className={`
            px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150
            ${active === jt
              ? "bg-primary-600 text-white shadow-sm shadow-primary-200 dark:shadow-primary-900"
              : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400"
            }
          `}
        >
          {jt}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
