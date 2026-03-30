import { useMemo } from 'react';
import { STATUS_COLORS } from './statusColors';
import { dateRange, todayString } from '../utils/dates';

export default function ProgressBar({ goal, days }) {
  const total = goal.totalDays;
  const today = todayString();

  const dates = useMemo(
    () => dateRange(goal.startDate, goal.endDate),
    [goal]
  );

  const counts = { green: 0, blue: 0, yellow: 0, red: 0 };
  Object.values(days).forEach(({ status }) => {
    if (status && counts[status] !== undefined) counts[status]++;
  });
  // Only count days with status as "filled"
  const filled = Object.values(days).filter(d => d.status).length;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-title">Progress</span>
        <span className="progress-pct">{pct}% — {filled} / {total} days</span>
      </div>

      {/* Sequential timeline — one rect per day */}
      <div className="progress-timeline" style={{ '--tl-cols': total }}>
        {dates.map((dateStr, i) => {
          const status = days[dateStr]?.status;
          const isFuture = dateStr > today;
          const isToday = dateStr === today;
          const note = days[dateStr]?.note;

          let bg;
          if (status) bg = STATUS_COLORS[status].bg;
          else if (isFuture) bg = '#fff';
          else bg = '#334155';

          const label = status ? STATUS_COLORS[status].label : (isFuture ? 'Future' : 'Not logged');
          const tooltip = [`Day ${i + 1} — ${dateStr}`, label, note ? `"${note}"` : null]
            .filter(Boolean).join('\n');

          return (
            <div
              key={dateStr}
              className={`timeline-cell${isToday ? ' tl-today' : ''}${isFuture ? ' tl-future' : ''}`}
              style={{ background: bg }}
              title={tooltip}
            />
          );
        })}
      </div>

      {/* Color counts */}
      <div className="progress-stats">
        {(['green', 'blue', 'yellow', 'red']).map((s) => (
          <div key={s} className="stat-chip">
            <span className="stat-dot" style={{ background: STATUS_COLORS[s].bg }} />
            <span className="stat-count">{counts[s]}</span>
            <span className="stat-name">{STATUS_COLORS[s].label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
