import React from "react";
import { Modal, Badge } from "../../common";
import { formatDate, formatDuration } from "../../../utils/formatters";

const Field = ({ label, value }) => (
  <div>
    <dt className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</dt>
    <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200 font-medium">{value || "—"}</dd>
  </div>
);

const RecordDetailModal = ({ record, onClose }) => (
  <Modal isOpen={!!record} onClose={onClose} title="Record Details" size="md">
    {record && (
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
        <Field label="Date"        value={formatDate(record.ictdate)} />
        <Field label="Job Type"    value={<Badge jobType={record.jobtype} />} />
        <Field label="Division"    value={record.divcode} />
        <Field label="DIP Code"    value={record.dipcode} />
        <Field label="Location"    value={record.loccode} />
        <Field label="Status"      value={record.status} />
        <Field label="Duration"    value={formatDuration(record.reuhour)} />
        <Field label="Assign By"   value={record.assignby} />
        <div className="col-span-2">
          <Field label="Description" value={record.logdesc} />
        </div>
        <div className="col-span-2">
          <Field label="Requester"   value={record.requester} />
        </div>
        <Field label="Incharge"    value={record.incharge} />
      </dl>
    )}
  </Modal>
);

export default RecordDetailModal;
