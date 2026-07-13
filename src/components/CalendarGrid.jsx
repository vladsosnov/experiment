import { useMemo } from 'react';
import DaySquare from './DaySquare';
import { dateRange, todayString, fromDateString } from '../utils/dates';
import { getEventForDate } from '../utils/events';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const EMPTY_EVENTS = [];

export default function CalendarGrid({ goal, days, events = EMPTY_EVENTS, onDayClick }) {
  const today = todayString();

  const { dates, paddingBefore } = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    // Monday-based: getDay() returns 0=Sun..6=Sat; convert to Mon=0
    const startDow = fromDateString(goal.startDate).getDay();
    const monBased = (startDow + 6) % 7; // 0=Mon…6=Sun
    return { dates: allDates, paddingBefore: monBased };
  }, [goal]);

  return (
    <div className="calendar-section">
      <div className="calendar-inner">
      <div className="weekday-headers">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="weekday-label">{d}</div>
        ))}
      </div>
      <div className="calendar-grid">
        {/* Empty cells to align first day to correct weekday */}
        {Array.from({ length: paddingBefore }).map((_, i) => (
          <div key={`pad-${i}`} className="day-square empty" />
        ))}
        {dates.map((dateStr, idx) => (
          <DaySquare
            key={dateStr}
            dateStr={dateStr}
            dayNumber={idx + 1}
            data={days[dateStr] ?? null}
            event={getEventForDate(events, dateStr)}
            isToday={dateStr === today}
            isFuture={dateStr > today}
            isLastDay={idx === dates.length - 1}
            onClick={onDayClick}
          />
        ))}
      </div>
      </div>
    </div>
  );
}
