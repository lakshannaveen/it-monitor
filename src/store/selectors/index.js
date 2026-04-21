import { createSelector } from "@reduxjs/toolkit";
import { groupByJobType } from "../../utils/helpers";

export const selectAllRecords = (state) => state.barcode.records;
export const selectLoading    = (state) => state.barcode.loading;
export const selectError      = (state) => state.barcode.error;
export const selectLastFetched = (state) => state.barcode.lastFetched;
export const selectTheme      = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectActiveJobType = (state) => state.ui.activeJobType;

export const selectGroupedByJobType = createSelector(
  selectAllRecords,
  (records) => groupByJobType(records)
);

export const selectJobTypes = createSelector(
  selectGroupedByJobType,
  (grouped) => ["All", ...Object.keys(grouped).sort()]
);

export const selectFilteredRecords = createSelector(
  selectAllRecords,
  selectActiveJobType,
  (records, jobType) =>
    jobType === "All" ? records : records.filter((r) => r.jobtype === jobType)
);

export const selectStats = createSelector(selectAllRecords, (records) => ({
  total:    records.length,
  hardware: records.filter((r) => r.jobtype === "Hardware").length,
  software: records.filter((r) => r.jobtype === "Software").length,
  network:  records.filter((r) => r.jobtype === "Network").length,
  totalHours: records.reduce((sum, r) => sum + parseFloat(r.reuhour || 0), 0),
}));
