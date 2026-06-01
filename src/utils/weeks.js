import { dateRange, fromDateString } from './dates';

function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getWeekRange(dateStr) {
  const start = fromDateString(dateStr);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  return {
    start: toDateString(start),
    end: toDateString(end),
  };
}

export function isDateInWeek(dateStr, weekDateStr) {
  const { start, end } = getWeekRange(weekDateStr);
  return dateRange(start, end).includes(dateStr);
}
