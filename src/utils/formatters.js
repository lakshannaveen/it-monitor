export const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return dateStr; }
};

export const formatDateISO = (dateStr) => {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch { return dateStr; }
};

export const formatDuration = (hours) => {
  if (!hours && hours !== 0) return "—";
  const h = parseFloat(hours);
  if (isNaN(h)) return hours;
  return h === 1 ? "1 hr" : `${h} hrs`;
};

export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + "…" : str || "—";
