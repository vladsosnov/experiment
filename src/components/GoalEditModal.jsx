import { useState } from 'react';
import { daysBetween, dateRange } from '../utils/dates';

export default function GoalEditModal({ goal, days, onSave, onClose }) {
  const [title, setTitle] = useState(goal.title);
  const [startDate, setStartDate] = useState(goal.startDate);
  const [endDate, setEndDate] = useState(goal.endDate);
  const [error, setError] = useState('');

  const total = startDate && endDate ? daysBetween(startDate, endDate) : null;

  // Detect logged days that would fall outside the new range
  const hiddenCount = (() => {
    if (!startDate || !endDate || endDate <= startDate) return 0;
    const newRange = new Set(dateRange(startDate, endDate));
    return Object.keys(days).filter((d) => !newRange.has(d)).length;
  })();

  function handleSave(e) {
    e.preventDefault();
    if (!startDate || !endDate) { setError('Both dates are required.'); return; }
    if (endDate <= startDate) { setError('End date must be after start date.'); return; }
    const totalDays = daysBetween(startDate, endDate);
    onSave({ ...goal, title: title.trim() || goal.title, startDate, endDate, totalDays });
    onClose();
  }

  return (
    <div className="modal-overlay" role="presentation" onClick={onClose} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-label="Edit goal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Edit goal</h2>
            <span className="modal-date">Change title or dates</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSave} className="edit-form">
          <label className="edit-label">
            Title
            <input
              type="text"
              className="edit-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Goal title"
            />
          </label>

          <div className="edit-date-row">
            <label className="edit-label">
              Start date
              <input
                type="date"
                className="edit-input"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setError(''); }}
              />
            </label>
            <label className="edit-label">
              End date
              <input
                type="date"
                className="edit-input"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setError(''); }}
              />
            </label>
          </div>

          {total && (
            <p className="edit-total">{total} day{total !== 1 ? 's' : ''} total</p>
          )}

          {hiddenCount > 0 && (
            <div className="edit-warning">
              ⚠️ {hiddenCount} logged day{hiddenCount !== 1 ? 's' : ''} fall outside the new range
              and will be hidden (but not deleted). Extend the range to restore them.
            </div>
          )}

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}
