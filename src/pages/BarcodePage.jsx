import React from "react";
import { useSelector } from "react-redux";
import { useFetch } from "../hooks/useFetch";
import { selectAllRecords, selectLoading, selectError } from "../store/selectors";
import { PageHeader } from "../components/common";
import Navigation from "../components/layout/Navigation";
import FilterBar from "../components/features/barcode/FilterBar";
import BarcodeTable from "../components/features/barcode/BarcodeTable";
import LoadingState from "./states/LoadingState";
import ErrorState from "./states/ErrorState";
import { RefreshCw } from "lucide-react";

const BarcodePage = () => {
  const { refetch, loading } = useFetch();
  const records = useSelector(selectAllRecords);
  const error = useSelector(selectError);

  if (loading && records.length === 0) return <LoadingState />;
  if (error && records.length === 0) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="animate-fade-in">
      <Navigation />
      <PageHeader
        title="Barcode Times"
        subtitle={`${records.length} total records retrieved from the API`}
        actions={
          <button
            onClick={refetch}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-600 dark:text-slate-300 hover:border-primary-400 hover:text-primary-700 dark:hover:text-primary-400 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        }
      />

      {/* Job type filter tabs */}
      <div className="mb-5">
        <FilterBar />
      </div>

      {/* Table */}
      <BarcodeTable />
    </div>
  );
};

export default BarcodePage;
