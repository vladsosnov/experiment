import { dateRange, fromDateString } from './dates';
import { getWeekRange } from './weeks';
import { STATUS_COLORS } from '../components/statusColors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function describeDay(dateStr, data) {
  if (!data) return 'No entry logged.';

  const parts = [];
  if (data.status) parts.push(STATUS_COLORS[data.status].label);
  if (data.note?.trim()) parts.push(`Note: "${data.note.trim()}"`);

  const completedTodos = (data.todos ?? []).filter((todo) => todo.completed).map((todo) => todo.text);
  const incompleteTodos = (data.todos ?? []).filter((todo) => !todo.completed).map((todo) => todo.text);
  if (completedTodos.length > 0) parts.push(`Completed: ${completedTodos.join(', ')}`);
  if (incompleteTodos.length > 0) parts.push(`Left unfinished: ${incompleteTodos.join(', ')}`);

  return parts.length > 0 ? parts.join(' | ') : 'No entry logged.';
}

/**
 * Build the Mon-Sun day range for the week containing anchorDate, clamped to the goal's dates.
 */
export function getCheckInWeekDates(goal, anchorDate) {
  const { start, end } = getWeekRange(anchorDate);
  const clampedStart = start < goal.startDate ? goal.startDate : start;
  const clampedEnd = end > goal.endDate ? goal.endDate : end;
  if (clampedStart > clampedEnd) return [];
  return dateRange(clampedStart, clampedEnd);
}

/**
 * Build a ChatGPT-ready prompt asking for a "Loves" weekly check-in reflection,
 * grounded in the user's actual daily notes/status/todos for the week.
 */
export function buildWeeklyCheckInPrompt(goal, days, anchorDate) {
  const weekDates = getCheckInWeekDates(goal, anchorDate);

  const dayLines = weekDates.map((dateStr) => {
    const dayName = DAY_NAMES[fromDateString(dateStr).getDay()];
    return `${dayName} (${dateStr}): ${describeDay(dateStr, days[dateStr])}`;
  });

  return `Introducing Loves
What you love doing is the best clue to your strengths. Each week, your Check-In will ask you to reflect back on what you found energizing or fulfilling, as a foundation to build on.

What activities did you love last week?
Write down activities during which you felt fulfilled, focused, or energized.

Here are my daily notes from Monday to Sunday for this week:
${dayLines.join('\n')}

Based on these notes, answer the question above for me: what activities did I love last week? Point to specific days/notes as evidence.`;
}
