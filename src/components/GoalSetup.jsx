import { useState } from 'react';
import { daysBetween, todayString } from '../utils/dates';

export default function GoalSetup({ onSave }) {
  const today = todayString();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [goalTitle, setGoalTitle] = useState('Experiment');
  const [error, setError] = useState('');

  const total = startDate && endDate ? daysBetween(startDate, endDate) : null;

  function handleQuickSet(days) {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + days - 1);
    const pad = (n) => String(n).padStart(2, '0');
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    setStartDate(fmt(start));
    setEndDate(fmt(end));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!startDate || !endDate) {
      setError('Please select both start and end dates.');
      return;
    }
    if (endDate <= startDate) {
      setError('End date must be after start date.');
      return;
    }
    const totalDays = daysBetween(startDate, endDate);
    onSave({ startDate, endDate, totalDays, title: goalTitle });
  }

  return (
    <div className="goal-setup">
      <div className="goal-setup-card">
        <h1>🎯 Goal Tracker</h1>
        <p className="subtitle">Set your goal period and start tracking every day.</p>

        <form onSubmit={handleSubmit}>
          <label>
            Goal title
            <input
              type="text"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="My 92-Day Goal"
            />
          </label>

          <div className="date-row">
            <label>
              Start date
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setError(''); }}
                required
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setError(''); }}
                required
              />
            </label>
          </div>

          <div className="quick-btns">
            <span className="quick-label">Quick set:</span>
            {[30, 66, 90, 100].map((d) => (
              <button
                key={d}
                type="button"
                className="quick-btn"
                onClick={() => handleQuickSet(d)}
              >
                {d} days
              </button>
            ))}
          </div>

          {total && (
            <p className="day-count">
              That's <strong>{total} day{total !== 1 ? 's' : ''}</strong> total.
            </p>
          )}

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn-primary">
            Start Tracking →
          </button>
        </form>
      </div>
    </div>
  );
}
