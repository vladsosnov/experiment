import { useEffect, useMemo, useRef } from 'react';
import confetti from 'canvas-confetti';
import { dateRange } from '../utils/dates';
import { STATUS_COLORS } from './statusColors';

const GOOD = new Set(['green', 'blue']);

function computeStreaks(goal, days) {
  const dates = dateRange(goal.startDate, goal.endDate);
  let current = 0, longest = 0, greenStreak = 0, longestGreen = 0;

  for (const d of dates) {
    const s = days[d]?.status;
    if (s && GOOD.has(s)) {
      current++;
      if (current > longest) longest = current;
    } else if (s) {
      current = 0;
    }
    // green-only streak
    if (s === 'green') {
      greenStreak++;
      if (greenStreak > longestGreen) longestGreen = greenStreak;
    } else if (s) {
      greenStreak = 0;
    }
  }
  return { currentStreak: current, longestStreak: longest, longestGreenStreak: longestGreen };
}

export default function Summary({ goal, days }) {
  const { currentStreak, longestStreak, longestGreenStreak } = useMemo(
    () => computeStreaks(goal, days),
    [goal, days]
  );

  const prevGreenStreakRef = useRef(longestGreenStreak);

  useEffect(() => {
    if (longestGreenStreak >= 7 && longestGreenStreak > prevGreenStreakRef.current) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#86efac', '#bbf7d0', '#f0fdf4'],
      });
    }
    prevGreenStreakRef.current = longestGreenStreak;
  }, [longestGreenStreak]);

  const counts = { green: 0, blue: 0, yellow: 0, red: 0 };
  Object.values(days).forEach(({ status }) => {
    if (status && counts[status] !== undefined) counts[status]++;
  });
  // Only count days with status as "filled"
  const filled = Object.values(days).filter(d => d.status).length;

  const bars = Object.entries(counts).map(([s, n]) => ({
    status: s,
    pct: filled > 0 ? Math.round((n / filled) * 100) : 0,
    count: n,
  }));

  return (
    <div className="summary-section">
      <div className="streaks">
        <div className="streak-card">
          <span className="streak-value">{currentStreak}</span>
          <span className="streak-label">Current streak 🔥</span>
          <span className="streak-sub">(green + blue)</span>
        </div>
        <div className="streak-card">
          <span className="streak-value">{longestStreak}</span>
          <span className="streak-label">Longest streak ⚡</span>
          <span className="streak-sub">(green + blue)</span>
        </div>
        <div className="streak-card">
          <span className="streak-value">{longestGreenStreak}</span>
          <span className="streak-label">Green streak 💚</span>
          {longestGreenStreak >= 7 && (
            <span className="streak-badge">🎉 7+ days!</span>
          )}
        </div>
      </div>

      <div className="mini-chart">
        <p className="mini-chart-title">Day composition ({filled} logged)</p>
        <div className="mini-chart-bars">
          {bars.map(({ status, pct, count }) => (
            <div key={status} className="mini-bar-row">
              <span
                className="mini-bar-dot"
                style={{ background: STATUS_COLORS[status].bg }}
              />
              <span className="mini-bar-name">{STATUS_COLORS[status].label}</span>
              <div className="mini-bar-track">
                <div
                  className="mini-bar-fill"
                  style={{ width: `${pct}%`, background: STATUS_COLORS[status].bg }}
                />
              </div>
              <span className="mini-bar-pct">{pct}%</span>
              <span className="mini-bar-count">({count})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
