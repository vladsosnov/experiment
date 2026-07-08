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

export function ensureDailyMentalCheck(checks, now = new Date(), makeId = createCheckId) {
  const currentChecks = Array.isArray(checks) ? checks : [];
  const date = localDateString(now);

  if (currentChecks.some((check) => mentalCheckDate(check) === date)) {
    return currentChecks;
  }

  return [...currentChecks, {
    id: makeId(),
    date,
    mood: null,
    comment: '',
    createdAt: now.toISOString(),
  }];
}
