const GOAL_KEY = 'goaltracker_goal';
const DAYS_KEY = 'goaltracker_days';

export function loadGoal() {
  try {
    const raw = localStorage.getItem(GOAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveGoal(goal) {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

export function loadDays() {
  try {
    const raw = localStorage.getItem(DAYS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveDays(days) {
  localStorage.setItem(DAYS_KEY, JSON.stringify(days));
}

export function clearAll() {
  localStorage.removeItem(GOAL_KEY);
  localStorage.removeItem(DAYS_KEY);
}
