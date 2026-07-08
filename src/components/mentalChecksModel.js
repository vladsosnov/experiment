import { dateRange } from '../utils/dates';

function localDateString(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createCheckId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function mentalCheckDate(check) {
  if (check?.date) return check.date;

  const createdAt = new Date(check?.createdAt);
  return Number.isNaN(createdAt.getTime()) ? '' : localDateString(createdAt);
}

export function ensureDailyMentalChecks(checks, startDate, now = new Date(), makeId = createCheckId) {
  const currentChecks = Array.isArray(checks) ? checks : [];
  const today = localDateString(now);
  const firstDate = startDate || today;
  const existingDates = new Set(currentChecks.map(mentalCheckDate));
  const missingDates = dateRange(firstDate, today).filter((date) => !existingDates.has(date));

  if (missingDates.length === 0) {
    return currentChecks;
  }

  const missingChecks = missingDates.map((date) => ({
    id: makeId(date),
    date,
    mood: null,
    comment: '',
    createdAt: now.toISOString(),
  }));

  return [...currentChecks, ...missingChecks]
    .sort((left, right) => mentalCheckDate(left).localeCompare(mentalCheckDate(right)));
}
