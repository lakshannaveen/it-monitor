import React from "react";
import { useSelector } from "react-redux";
import { Layers, Clock, Monitor, Wifi } from "lucide-react";
import { selectStats, selectGroupedByJobType, selectAllRecords, selectLoading, selectError } from "../store/selectors";
import { useFetch } from "../hooks/useFetch";
import Navigation from "../components/layout/Navigation";
import StatsCard from "../components/features/dashboard/StatsCard";
import JobTypeChart from "../components/features/dashboard/JobTypeChart";
import RecentActivity from "../components/features/dashboard/RecentActivity";
import EmployeeStrip from "../components/features/dashboard/EmployeeStrip";
import StatusPieChart from "../components/features/dashboard/StatusPieChart";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";

const DashboardPage = () => {
  const { refetch } = useFetch();
  const stats = useSelector(selectStats);
  const grouped = useSelector(selectGroupedByJobType);
  const records = useSelector(selectAllRecords);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  if (loading && records.length === 0) return <LoadingState />;
  if (error && records.length === 0) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      <Navigation />

      {/* Section A – Employee Strip */}
      <EmployeeStrip records={records} />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard label="Total Records"    value={stats.total}             icon={Layers}  color="blue"   sub="All job types" />
        <StatsCard label="Hardware"         value={stats.hardware}          icon={Monitor} color="blue"   sub="Hardware jobs" />
        <StatsCard label="Software"         value={stats.software}          icon={Layers}  color="indigo" sub="Software jobs" />
        <StatsCard label="Total Hours"      value={`${stats.totalHours}h`}  icon={Clock}   color="sky"    sub="Reported hours" />
      </div>

      {/* Chart row: Job Type + Status Pie (Section B) + Recent Activity (Section C) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left column: Job Type Distribution bar chart + Status Pie chart */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <JobTypeChart grouped={grouped} />
          {/* Section B – Status Pie Chart */}
          <StatusPieChart records={records} />
        </div>

        {/* Right column: Recent Activity / In-Progress tabs (Section C) */}
        <div className="lg:col-span-3">
          <RecentActivity records={records} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
