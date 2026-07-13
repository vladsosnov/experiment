import { STATUS_COLORS } from '../components/statusColors';
import { isHoliday, HOLIDAY_COUNTRY, OBSERVED_HOLIDAY_DATES, HOLIDAY_DATES, dateRange } from './dates';

export const PERSONAL_VACATION_DATES = [
  '2026-06-04',
  '2026-06-05',
];

const FLAG_BACKGROUNDS = {
  ukraine: { bg: 'linear-gradient(to bottom, #005BBB 50%, #FFD500 50%)' },
  poland: { bg: 'linear-gradient(to bottom, #fff 50%, #DC143C 50%)', textColor: '#000' },
};

const SPECIAL_DAY_COLORS = {
  vacation: {
    bg: '#ED80E9',
    key: 'vacation',
    label: 'Vacation day',
  },
  personalVacation: {
    bg: '#c4b5fd',
    key: 'personalVacation',
    label: 'Vacation',
  },
  workedWeekend: {
    ...STATUS_COLORS.purple,
    key: 'workedWeekend',
  },
};

function getHolidayCountry(dateStr) {
  const observedIdx = OBSERVED_HOLIDAY_DATES.indexOf(dateStr);
  if (observedIdx === -1) return null;
  const originalDate = HOLIDAY_DATES[observedIdx];
  return HOLIDAY_COUNTRY[originalDate] || null;
}

export function getDateSpecialDay(dateStr) {
  if (PERSONAL_VACATION_DATES.includes(dateStr)) return SPECIAL_DAY_COLORS.personalVacation;
  if (isHoliday(dateStr)) {
    const country = getHolidayCountry(dateStr);
    const flag = country ? FLAG_BACKGROUNDS[country] : null;
    return {
      ...SPECIAL_DAY_COLORS.vacation,
      bg: flag ? flag.bg : SPECIAL_DAY_COLORS.vacation.bg,
      ...(flag?.textColor ? { textColor: flag.textColor } : {}),
    };
  }
  return null;
}

export function getPrioritySpecialDay(dateStr, workedWeekend) {
  if (workedWeekend) return SPECIAL_DAY_COLORS.workedWeekend;
  return getDateSpecialDay(dateStr);
}

/**
 * List built-in special days (holidays, personal vacation) within a date range.
 */
export function listSpecialDaysInRange(startDate, endDate) {
  return dateRange(startDate, endDate)
    .map((date) => {
      const specialDay = getDateSpecialDay(date);
      return specialDay ? { date, label: specialDay.label, bg: specialDay.bg } : null;
    })
    .filter(Boolean);
}

export function getDaySquareAppearance({ data, dateStr, dayNumber, isFuture, isToday, event }) {
  const status = data?.status ?? null;
  const workedWeekend = data?.workedWeekend ?? false;
  const specialDay = status && !workedWeekend ? null : getPrioritySpecialDay(dateStr, workedWeekend);
  // A custom event outranks built-in special days as the cell's highlight.
  const highlight = event ? { bg: event.color, label: event.text } : specialDay;
  const isSplit = Boolean(highlight && status);
  const bg = isSplit
    ? 'transparent'
    : (highlight
      ? highlight.bg
      : (status
        ? STATUS_COLORS[status].bg
        : (isFuture ? '#1e293b' : '#334155')));
  const label = highlight
    ? (status ? `${highlight.label} + ${STATUS_COLORS[status].label}` : highlight.label)
    : (status ? STATUS_COLORS[status].label : (isToday ? 'Today' : `Day ${dayNumber}`));

  return {
    bg,
    isSplit,
    label,
    splitLeftBg: isSplit ? highlight.bg : null,
    splitRightBg: isSplit ? STATUS_COLORS[status].bg : null,
    textColor: event ? null : (specialDay?.textColor || null),
    eventText: event ? event.text : null,
  };
}
