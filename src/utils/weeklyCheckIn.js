import { dateRange, fromDateString } from './dates';
import { getWeekRange } from './weeks';
import { STATUS_COLORS } from '../components/statusColors';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function humanizeText(text) {
  return text.replace(/leetcode/gi, 'algorithm');
}

function describeDay(dateStr, data) {
  if (!data) return 'No entry logged.';

  const parts = [];
  if (data.status) parts.push(STATUS_COLORS[data.status].label);
  if (data.note?.trim()) parts.push(`Note: "${humanizeText(data.note.trim())}"`);

  const completedTodos = (data.todos ?? [])
    .filter((todo) => todo.completed)
    .map((todo) => humanizeText(todo.text));
  const incompleteTodos = (data.todos ?? [])
    .filter((todo) => !todo.completed)
    .map((todo) => humanizeText(todo.text));
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

  return `Hi! This is my weekly check-in - a quick way to reflect on what energized me at work. Looking back like this usually shows me where my real strengths are.

What did I love doing last week? Read my notes below and tell me, with examples from specific days, what stood out. My notes mix work and personal life - please ignore personal stuff like hobbies, movies, workouts, concerts, or errands, and focus only on professional and work-related activities.

My notes, Monday to Sunday:
${dayLines.join('\n')}

Please reply with just a short summary, around 600-700 characters, written in plain, natural language. Write it in first person, as if I'm the one saying it - for example "I made good progress on..." or "I loved doing...", not "you did...".`;
}
