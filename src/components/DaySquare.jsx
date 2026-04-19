import { getDaySquareAppearance } from '../utils/dayAppearance';
import { countIncompleteTodos } from '../utils/todos';

export default function DaySquare({ dateStr, dayNumber, data, isToday, isFuture, isLastDay, onClick }) {
  // Extract day/month from dateStr (YYYY-MM-DD)
  const parts = dateStr.split('-');
  const dayOfMonth = parseInt(parts[2], 10);
  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthName = MONTH_NAMES[parseInt(parts[1], 10) - 1];
  const note = data?.note;
  const incompleteTodoCount = countIncompleteTodos(data?.todos);
  const hasIncompleteTodos = incompleteTodoCount > 0;
  const { bg, isSplit, label, splitLeftBg, splitRightBg } = getDaySquareAppearance({
    data,
    dateStr,
    dayNumber,
    isFuture,
    isToday,
  });
  const opacity = isFuture ? 0.35 : 1;

  let borderStyle = { background: bg, border: '1px solid #f8fafc' };

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
          <span className="split-half split-left" style={{ background: splitLeftBg }} />
          <span className="split-half split-right" style={{ background: splitRightBg }} />
        </>
      )}
      {hasIncompleteTodos && <span className="todo-indicator">{incompleteTodoCount}</span>}
      <span className="day-date">{monthName} {dayOfMonth}</span>
      <span className="day-number">{dayNumber}</span>
    </div>
  );
}
