/**
 * Format a Date object as "YYYY-MM-DD" in local time (no UTC shift).
 */
function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a "YYYY-MM-DD" string into a local-time Date (midnight).
 */
export function fromDateString(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Return the number of inclusive days between two date strings.
 */
export function daysBetween(startStr, endStr) {
  const start = fromDateString(startStr);
  const end = fromDateString(endStr);
  return Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Return an array of all date strings from startStr to endStr (inclusive).
 */
export function dateRange(startStr, endStr) {
  const dates = [];
  const current = fromDateString(startStr);
  const end = fromDateString(endStr);
  while (current <= end) {
    dates.push(toDateString(new Date(current)));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export function todayString() {
  return toDateString(new Date());
}
