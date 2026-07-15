import { dateRange, fromDateString } from './dates';

export const PLAN_NEXT_DAY_TODO_TEXT = 'Plan your next day';
export const PLAN_NEXT_DAY_START_DATE = '2026-04-16';
export const LEETCODE_TODO_TEXT = 'Solve 1 LeetCode problem';
export const LEETCODE_TODO_START_DATE = '2026-06-04';
export const READING_TODO_TEXT = 'Reading 10 mins';
export const READING_TODO_START_DATE = '2026-06-06';
export const FINANCIAL_CHECKIN_TODO_TEXT = 'Financial checkin';
export const FINANCIAL_CHECKIN_TODO_START_DATE = '2026-06-06';
export const CREATIVE_WORK_TODO_TEXT = 'Submit creative work';
export const CREATIVE_WORK_TODO_START_DATE = '2026-07-13';
export const CREATIVE_WORK_TODO_DAY_OF_MONTH = 24;

const SEEDED_TODOS = [
  {
    text: PLAN_NEXT_DAY_TODO_TEXT,
    startDate: PLAN_NEXT_DAY_START_DATE,
    idPrefix: 'seed-plan-next-day',
    dismissKey: 'dismissSeededPlanningTodo',
  },
  {
    text: LEETCODE_TODO_TEXT,
    startDate: LEETCODE_TODO_START_DATE,
    idPrefix: 'seed-leetcode',
    dismissKey: 'dismissSeededLeetcodeTodo',
  },
  {
    text: READING_TODO_TEXT,
    startDate: READING_TODO_START_DATE,
    idPrefix: 'seed-reading',
    dismissKey: 'dismissSeededReadingTodo',
  },
  {
    text: FINANCIAL_CHECKIN_TODO_TEXT,
    startDate: FINANCIAL_CHECKIN_TODO_START_DATE,
    idPrefix: 'seed-financial-checkin',
    dismissKey: 'dismissSeededFinancialCheckinTodo',
    dayOfWeek: 0,
  },
  {
    text: CREATIVE_WORK_TODO_TEXT,
    startDate: CREATIVE_WORK_TODO_START_DATE,
    idPrefix: 'seed-creative-work',
    dismissKey: 'dismissSeededCreativeWorkTodo',
    dayOfMonth: CREATIVE_WORK_TODO_DAY_OF_MONTH,
  },
];

function createSeededTodo(seed, dateStr) {
  return {
    id: `${seed.idPrefix}-${dateStr}`,
    text: seed.text,
    completed: false,
  };
}

function isQualifyingSeededTodoDate(seed, dateStr) {
  if (dateStr < seed.startDate) return false;
  if (typeof seed.dayOfWeek === 'number') return fromDateString(dateStr).getDay() === seed.dayOfWeek;
  if (typeof seed.dayOfMonth === 'number') return fromDateString(dateStr).getDate() === seed.dayOfMonth;
  return true;
}

function shouldDismissSeededTodo(seed, dateStr, day) {
  if (!isQualifyingSeededTodoDate(seed, dateStr)) return false;
  return !(day?.todos ?? []).some((todo) => todo.text === seed.text);
}

export function shouldDismissSeededPlanningTodo(dateStr, day) {
  return shouldDismissSeededTodo(SEEDED_TODOS[0], dateStr, day);
}

export function normalizeSavedDay(dateStr, day) {
  if (day === null) return null;

  const dismissedSeeds = SEEDED_TODOS
    .filter((seed) => shouldDismissSeededTodo(seed, dateStr, day))
    .reduce((dismissals, seed) => ({ ...dismissals, [seed.dismissKey]: true }), {});
  const hasDismissedSeeds = Object.keys(dismissedSeeds).length > 0;
  const hasContent = day.status || (day.todos && day.todos.length > 0);

  if (hasContent) {
    return hasDismissedSeeds
      ? { ...day, ...dismissedSeeds }
      : day;
  }

  if (hasDismissedSeeds) {
    return {
      ...dismissedSeeds,
      todos: [],
    };
  }

  return null;
}

export function applySeededPlanningTodo(goal, days) {
  if (!goal) return days;

  let changed = false;
  const next = { ...days };

  for (const dateStr of dateRange(goal.startDate, goal.endDate)) {
    const currentDay = next[dateStr] ?? {};
    let todos = currentDay.todos ?? [];
    let dayChanged = false;

    for (const seed of SEEDED_TODOS) {
      if (!isQualifyingSeededTodoDate(seed, dateStr)) continue;
      if (currentDay[seed.dismissKey]) continue;

      const hasSeededTodo = todos.some((todo) => todo.text === seed.text);
      if (hasSeededTodo) continue;

      todos = [...todos, createSeededTodo(seed, dateStr)];
      dayChanged = true;
    }

    if (dayChanged) {
      next[dateStr] = {
        ...currentDay,
        todos,
      };
      changed = true;
    }
  }

  return changed ? next : days;
}
