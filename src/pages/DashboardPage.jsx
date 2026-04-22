import React from "react";
import { useSelector } from "react-redux";
import { selectStats, selectGroupedByJobType, selectAllRecords, selectLoading, selectError } from "../store/selectors";
import { useFetch } from "../hooks/useFetch";
import EmployeeStrip from "../components/features/dashboard/EmployeeStrip";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";

const DashboardPage = () => {
  const { refetch } = useFetch();
  const stats = useSelector(selectStats);
  const records = useSelector(selectAllRecords);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  if (loading && records.length === 0) return <LoadingState />;
  if (error && records.length === 0) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      {/* Section A – Employee Strip */}
      <EmployeeStrip records={records} stats={stats} />
    </div>
  );
};

export default DashboardPage;
