import { STATUS_COLORS } from './statusColors';

export default function DaySquare({ dateStr, dayNumber, data, isToday, isFuture, isLastDay, onClick }) {
  const status = data?.status;
  const note = data?.note;
  const hasIncompleteTodos = data?.todos && data.todos.some(t => !t.completed);

  const bg = status ? STATUS_COLORS[status].bg : (isFuture ? '#1e293b' : '#334155');
  const opacity = isFuture ? 0.35 : 1;

  let borderStyle = { background: bg, border: '1px solid #f8fafc' };

  const label = status ? STATUS_COLORS[status].label : (isToday ? 'Today' : `Day ${dayNumber}`);
  const tooltip = [
    `Day ${dayNumber} — ${dateStr}`,
    label,
    note ? `"${note}"` : null,
  ].filter(Boolean).join('\n');

  return (
    <div
      className={`day-square${isToday ? ' today' : ''}${isFuture ? ' future' : ''}${isLastDay ? ' last-day' : ''}`}
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
      {hasIncompleteTodos && <span className="todo-indicator" />}
      <span className="day-number">{dayNumber}</span>
    </div>
  );
}
