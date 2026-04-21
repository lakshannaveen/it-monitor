export const groupByJobType = (records = []) => {
  return records.reduce((acc, record) => {
    const key = record.jobtype || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(record);
    return acc;
  }, {});
};

export const getUniqueValues = (records = [], key) =>
  [...new Set(records.map((r) => r[key]).filter(Boolean))];
