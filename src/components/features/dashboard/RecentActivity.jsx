import React, { useMemo, useState } from "react";
import Card from "../../common/Card";
import Badge from "../../common/Badge";
import { formatDate, formatDuration } from "../../../utils/formatters";
import { barcodeService } from "../../../services/barcodeService";

const AVATAR_COLORS = [
  ["#3b82f6", "#1d4ed8"],
  ["#8b5cf6", "#6d28d9"],
  ["#06b6d4", "#0891b2"],
  ["#10b981", "#059669"],
  ["#f59e0b", "#d97706"],
  ["#ef4444", "#dc2626"],
  ["#ec4899", "#db2777"],
  ["#6366f1", "#4f46e5"],
];

const getAvatarColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const parseServiceNo = (value) => {
  const match = String(value || "").match(/\b(\d{4,})\b/);
  return match ? match[1] : null;
};

const getRecordServiceNo = (record = {}) => {
  // Prefer service number from RequestedBy/requestedBy/requester (requester's photo)
  const parsedFromRequested = parseServiceNo(record.RequestedBy || record.requestedBy || record.requester || "");
  if (parsedFromRequested) return parsedFromRequested;

  // Then prefer explicit numeric fields for assignee/incharge
  if (record.serviceNo) return String(record.serviceNo);
  if (record.Service_No) return String(record.Service_No);
  if (record.incharge) return String(record.incharge);
  if (record.officerincharge) return String(record.officerincharge);
  if (record.OfficerIncharge) return String(record.OfficerIncharge);

  // Finally try other fields like officer
  const parsedFromOfficer = parseServiceNo(record.officer || "");
  if (parsedFromOfficer) return parsedFromOfficer;

  return null;
};

const Avatar = ({ name, serviceNo, size = "sm" }) => {
  const [from, to] = getAvatarColor(name);
  const initials = getInitials(name);
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm";
  const imageUrl = serviceNo ? barcodeService.getUserImageUrl(serviceNo) : null;
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className={`${sizeClass} rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm overflow-hidden relative`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
      {imageUrl && (
        <img
          src={imageUrl}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: loaded ? 1 : 0, transition: "opacity 200ms ease-in-out" }}
        />
      )}
      <span style={{ opacity: loaded ? 0 : 1, transition: "opacity 200ms ease-in-out" }}>{initials}</span>
    </div>
  );
};

const isInProgress = (record) => {
  const status = (record.status || record.jobstatus || "").toLowerCase();
  if (status.includes("progress") || status.includes("inprogress")) return true;
  if (status.includes("complete") || status.includes("done") || status.includes("pending") || status.includes("hold")) return false;
  return parseFloat(record.reuhour || 0) > 0;
};

const getRecordTime = (record) => {
  const ts = new Date(record?.ictdate || 0).getTime();
  return Number.isFinite(ts) ? ts : 0;
};

const parseNameFromField = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  // common format: "12345 - NAME" or "12345- NAME"
  const parts = s.split(/-\s*/);
  if (parts.length >= 2) return parts.slice(1).join("-").trim();
  // fallback: remove leading numbers
  return s.replace(/^\s*\d+\s*-?\s*/, "");
};

const groupByEmployee = (records) => {
  const map = {};
  records.filter(isInProgress).forEach((record) => {
    // Prefer the requester/requestedBy as the primary identity (they requested the job)
    const rawRequested = record.RequestedBy || record.requestedBy || record.requester || "";
    const parsedName = parseNameFromField(rawRequested) || record.requester || record.officer || "Unknown";
    const name = parsedName;
    const serviceNo = getRecordServiceNo(record);
    const key = serviceNo || name;
    if (!map[key]) {
      map[key] = { key, name, serviceNo, record };
      return;
    }
    if (getRecordTime(record) > getRecordTime(map[key].record)) {
      map[key].record = record;
    }
  });
  return Object.values(map).sort((a, b) => getRecordTime(b.record) - getRecordTime(a.record));
};

const InProgressSummary = ({ records }) => {
  const groups = useMemo(() => groupByEmployee(records), [records]);

  if (groups.length === 0) {
    return (
      <div className="px-5 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
        No in-progress jobs
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {groups.map(({ key, name, serviceNo, record }) => {
        return (
          <div key={key}>
            <div className="w-full flex items-start gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Avatar name={name} serviceNo={serviceNo} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{name}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-1 mt-0.5">{record.logdesc || "-"}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge jobType={record.jobtype} />
                  <p className="text-xs text-slate-400">{formatDate(record.ictdate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  Active
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {formatDuration(record.reuhour)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RecentActivity = ({ records }) => {
  const inProgressCount = useMemo(() => groupByEmployee(records).length, [records]);

  return (
    <Card padding={false} className="h-full flex flex-col">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-1">
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white shadow-sm flex items-center gap-1.5">
          In Progress
          {inProgressCount > 0 && (
            <span className="rounded-full px-1.5 text-xs font-bold bg-white/20 text-white">
              {inProgressCount}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <InProgressSummary records={records} />
      </div>
    </Card>
  );
};

export default RecentActivity;
