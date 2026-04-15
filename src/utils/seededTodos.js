import { dateRange } from './dates';

export const PLAN_NEXT_DAY_TODO_TEXT = 'Plan your next day';
export const PLAN_NEXT_DAY_START_DATE = '2026-04-16';

function createSeededTodo(dateStr) {
  return {
    id: `seed-plan-next-day-${dateStr}`,
    text: PLAN_NEXT_DAY_TODO_TEXT,
    completed: false,
  };
}

function isQualifyingSeededPlanningTodoDate(dateStr) {
  return dateStr >= PLAN_NEXT_DAY_START_DATE;
}

export function shouldDismissSeededPlanningTodo(dateStr, day) {
  if (!isQualifyingSeededPlanningTodoDate(dateStr)) return false;
  return !(day?.todos ?? []).some((todo) => todo.text === PLAN_NEXT_DAY_TODO_TEXT);
}

export function normalizeSavedDay(dateStr, day) {
  if (day === null) return null;

  const dismissSeededPlanningTodo = shouldDismissSeededPlanningTodo(dateStr, day);
  const hasContent = day.status || (day.todos && day.todos.length > 0);

  if (hasContent) {
    return dismissSeededPlanningTodo
      ? { ...day, dismissSeededPlanningTodo: true }
      : day;
  }

  if (dismissSeededPlanningTodo) {
    return {
      dismissSeededPlanningTodo: true,
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
    if (!isQualifyingSeededPlanningTodoDate(dateStr)) continue;

    const currentDay = next[dateStr] ?? {};
    if (currentDay.dismissSeededPlanningTodo) continue;

    const todos = currentDay.todos ?? [];
    const hasSeededTodo = todos.some((todo) => todo.text === PLAN_NEXT_DAY_TODO_TEXT);

    if (hasSeededTodo) continue;

    next[dateStr] = {
      ...currentDay,
      todos: [...todos, createSeededTodo(dateStr)],
    };
    changed = true;
  }

  return changed ? next : days;
}
