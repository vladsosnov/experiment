import { STATUS_COLORS } from './statusColors';
import { isHoliday } from '../utils/dates';
import { countIncompleteTodos } from '../utils/todos';

export default function DaySquare({ dateStr, dayNumber, data, isToday, isFuture, isLastDay, onClick }) {
  // Extract day/month from dateStr (YYYY-MM-DD)
  const parts = dateStr.split('-');
  const dayOfMonth = parseInt(parts[2], 10);
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthName = MONTH_NAMES[parseInt(parts[1], 10) - 1];
  const status = data?.status;
  const note = data?.note;
  const incompleteTodoCount = countIncompleteTodos(data?.todos);
  const hasIncompleteTodos = incompleteTodoCount > 0;
  const workedWeekend = data?.workedWeekend;
  const holiday = isHoliday(dateStr);

  // Determine if we need split colors (worked weekend + status selected)
  const isSplit = workedWeekend && status;

  // For non-split squares, use original logic
  const bg = isSplit
    ? 'transparent'
    : (workedWeekend
      ? STATUS_COLORS.purple.bg
      : (status
        ? STATUS_COLORS[status].bg
        : (holiday ? '#f9a8d4' : (isFuture ? '#1e293b' : '#334155'))));
  const opacity = isFuture ? 0.35 : 1;

  let borderStyle = { background: bg, border: '1px solid #f8fafc' };

  const label = workedWeekend
    ? (status ? `${STATUS_COLORS.purple.label} + ${STATUS_COLORS[status].label}` : STATUS_COLORS.purple.label)
    : (status ? STATUS_COLORS[status].label : (holiday ? 'Holiday' : (isToday ? 'Today' : `Day ${dayNumber}`)));
  const tooltip = [
    `Day ${dayNumber} — ${dateStr}`,
    label,
    note ? `"${note}"` : null,
  ].filter(Boolean).join('\n');

  return (
    <div
      className={`day-square${isToday ? ' today' : ''}${isFuture ? ' future' : ''}${isLastDay ? ' last-day' : ''}${isSplit ? ' split' : ''}`}
      style={{ ...borderStyle, opacity }}
      title={tooltip}
      onClick={() => onClick(dateStr)}
      role="button"
      aria-label={tooltip}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick(dateStr);
      }}
    >
      {isSplit && (
        <>
          <span className="split-half split-left" style={{ background: STATUS_COLORS.purple.bg }} />
          <span className="split-half split-right" style={{ background: STATUS_COLORS[status].bg }} />
        </>
      )}
      {hasIncompleteTodos && <span className="todo-indicator">{incompleteTodoCount}</span>}
      <span className="day-date">{monthName} {dayOfMonth}</span>
      <span className="day-number">{dayNumber}</span>
    </div>
  );
}
