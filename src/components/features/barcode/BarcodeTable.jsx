import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Eye, Search } from "lucide-react";
import { selectFilteredRecords } from "../../../store/selectors";
import { Table, Badge } from "../../common";
import { formatDate, formatDuration, truncate } from "../../../utils/formatters";
import RecordDetailModal from "./RecordDetailModal";

const BarcodeTable = () => {
  const records = useSelector(selectFilteredRecords);
  const [search, setSearch] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filtered = search.trim()
    ? records.filter((r) =>
        Object.values(r).some((v) =>
          String(v).toLowerCase().includes(search.toLowerCase())
        )
      )
    : records;

  const columns = [
    { key: "ictdate",   label: "Date",        render: (v) => formatDate(v) },
    { key: "jobtype",   label: "Job Type",     render: (v) => <Badge jobType={v} /> },
    { key: "divcode",   label: "Division" },
    { key: "dipcode",   label: "DIP" },
    { key: "loccode",   label: "Location" },
    { key: "logdesc",   label: "Description",  render: (v) => <span title={v}>{truncate(v, 35)}</span> },
    { key: "requester", label: "Requester",    render: (v) => truncate(v, 25) },
    { key: "status",    label: "Status" },
    { key: "reuhour",   label: "Duration",     render: (v) => formatDuration(v) },
    {
      key: "_action",
      label: "",
      render: (_, row) => (
        <button
          onClick={() => setSelectedRecord(row)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
          title="View details"
        >
          <Eye size={15} />
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 w-full sm:max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search records…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-600 transition"
        />
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <Table columns={columns} data={filtered} emptyMessage="No records match your filters." />
      </div>

      <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
        Showing {filtered.length} of {records.length} records
      </p>

      <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
    </div>
  );
};

export default BarcodeTable;
