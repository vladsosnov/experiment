import { STATUS_COLORS } from './statusColors';

export default function DaySquare({ dateStr, dayNumber, data, isToday, isFuture, isLastDay, onClick }) {
  // Extract day of month from dateStr (YYYY-MM-DD)
  const dayOfMonth = parseInt(dateStr.split('-')[2], 10);
  const status = data?.status;
  const note = data?.note;
  const hasIncompleteTodos = data?.todos && data.todos.some(t => !t.completed);
  const workedWeekend = data?.workedWeekend;

  // Determine if we need split colors (worked weekend + status selected)
  const isSplit = workedWeekend && status;

  // For non-split squares, use original logic
  const bg = isSplit ? 'transparent' : (workedWeekend ? STATUS_COLORS.purple.bg : (status ? STATUS_COLORS[status].bg : (isFuture ? '#1e293b' : '#334155')));
  const opacity = isFuture ? 0.35 : 1;

  let borderStyle = { background: bg, border: '1px solid #f8fafc' };

  const label = workedWeekend
    ? (status ? `${STATUS_COLORS.purple.label} + ${STATUS_COLORS[status].label}` : STATUS_COLORS.purple.label)
    : (status ? STATUS_COLORS[status].label : (isToday ? 'Today' : `Day ${dayNumber}`));
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
      {hasIncompleteTodos && <span className="todo-indicator" />}
      <span className="day-date">{dayOfMonth}</span>
      <span className="day-number">{dayNumber}</span>
    </div>
  );
}
