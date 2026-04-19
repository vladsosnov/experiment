import { STATUS_COLORS } from '../components/statusColors';
import { isHoliday } from './dates';

export const DAY_FOR_ME_DATES = [
  '2026-02-16',
  '2026-05-15',
  '2026-09-25',
  '2026-12-28',
];

const SPECIAL_DAY_COLORS = {
  dayForMe: {
    bg: '#c6a2f6',
    key: 'dayForMe',
    label: 'Day for me',
  },
  vacation: {
    bg: '#f4b4cf',
    key: 'vacation',
    label: 'Vacation day',
  },
  workedWeekend: {
    ...STATUS_COLORS.purple,
    key: 'workedWeekend',
  },
};

export function getDateSpecialDay(dateStr) {
  if (DAY_FOR_ME_DATES.includes(dateStr)) return SPECIAL_DAY_COLORS.dayForMe;
  if (isHoliday(dateStr)) return SPECIAL_DAY_COLORS.vacation;
  return null;
}

export function getPrioritySpecialDay(dateStr, workedWeekend) {
  if (workedWeekend) return SPECIAL_DAY_COLORS.workedWeekend;
  return getDateSpecialDay(dateStr);
}

export function getDaySquareAppearance({ data, dateStr, dayNumber, isFuture, isToday }) {
  const status = data?.status ?? null;
  const workedWeekend = data?.workedWeekend ?? false;
  const specialDay = getPrioritySpecialDay(dateStr, workedWeekend);
  const isSplit = Boolean(specialDay && status);
  const bg = isSplit
    ? 'transparent'
    : (specialDay
      ? specialDay.bg
      : (status
        ? STATUS_COLORS[status].bg
        : (isFuture ? '#1e293b' : '#334155')));
  const label = specialDay
    ? (status ? `${specialDay.label} + ${STATUS_COLORS[status].label}` : specialDay.label)
    : (status ? STATUS_COLORS[status].label : (isToday ? 'Today' : `Day ${dayNumber}`));

  return {
    bg,
    isSplit,
    label,
    splitLeftBg: isSplit ? specialDay.bg : null,
    splitRightBg: isSplit ? STATUS_COLORS[status].bg : null,
  };
}
