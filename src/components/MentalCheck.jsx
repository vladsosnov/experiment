import React, { useEffect, useState } from 'react';
import { mentalCheckDate } from './mentalChecksModel';

const MOODS = [
  { value: 'great', label: 'Great', color: '#50C878' },
  { value: 'good', label: 'Good', color: '#6395EE' },
  { value: 'normal', label: 'Normal', color: '#FFCE1B' },
  { value: 'sad', label: 'Sad', color: '#FA5053' },
];

const MOOD_BY_VALUE = Object.fromEntries(MOODS.map((mood) => [mood.value, mood]));
const EMPTY_CHECKS = [];

function formatCheckDate(check) {
  const dateKey = mentalCheckDate(check);
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

export default function MentalCheck({ checks = EMPTY_CHECKS, onChange }) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCheck, setEditingCheck] = useState(null);
  const [mood, setMood] = useState(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function closeForm() {
    setFormOpen(false);
    setEditingCheck(null);
    setMood(null);
    setComment('');
    setError('');
    setSaving(false);
  }

  useEffect(() => {
    if (!formOpen) return undefined;
    function handleKeyDown(e) {
      if (e.key === 'Escape') closeForm();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formOpen]);

  function openEditForm(check) {
    setEditingCheck(check);
    setMood(check.mood ?? null);
    setComment(check.comment ?? '');
    setError('');
    setSaving(false);
    setFormOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const cleanComment = comment.trim();
    if (!mood) {
      setError('Choose how you feel.');
      return;
    }
    if (!cleanComment) {
      setError('Add a short reflection before saving.');
      return;
    }

    const timestamp = new Date().toISOString();
    const next = checks.map((check) => check.id === editingCheck.id
      ? { ...check, mood, comment: cleanComment, updatedAt: timestamp }
      : check);

    setSaving(true);
    setError('');
    try {
      await onChange(next);
      closeForm();
    } catch {
      setError('Could not save this mental check. Try again.');
      setSaving(false);
    }
  }

  return (
    <section className="mental-check-section">
      <div className="notes-header mental-check-header">
        <div>
          <span className="notes-title">Mental check</span>
          <span className="reflections-subtitle">A simple record of how you have been feeling</span>
        </div>
        <div className="reflections-header-actions">
          <span className="notes-count">{checks.length} day{checks.length === 1 ? '' : 's'}</span>
        </div>
      </div>

      {checks.length === 0 ? (
        <p className="mental-check-empty">No mental checks yet</p>
      ) : (
        <div className="mental-check-board" aria-label="Mental check history">
          {checks.map((check, index) => {
            const moodDetails = MOOD_BY_VALUE[check.mood];
            const dateLabel = formatCheckDate(check);
            const filled = Boolean(moodDetails);
            const tooltip = filled
              ? [`${moodDetails.label}${dateLabel ? ` - ${dateLabel}` : ''}`, check.comment].filter(Boolean).join('\n')
              : `Fill in mental check${dateLabel ? ` for ${dateLabel}` : ''}`;
            return (
              <button
                type="button"
                className={`mental-check-square${filled ? '' : ' unfilled'}`}
                key={check.id ?? `${check.createdAt}-${index}`}
                style={{ '--mental-color': moodDetails?.color ?? '#334155' }}
                title={tooltip}
                aria-label={filled ? `Edit ${tooltip}` : tooltip}
                onClick={() => openEditForm(check)}
              >
                <span className="mental-check-date">{dateLabel}</span>
                {!filled && <span className="mental-check-prompt" aria-hidden="true">+</span>}
              </button>
            );
          })}
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeForm}>
          <div className="modal mental-check-modal" role="dialog" aria-modal="true" aria-labelledby="mental-check-title" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 id="mental-check-title">How are you feeling?</h2>
                <span className="modal-date">{formatCheckDate(editingCheck)}</span>
              </div>
              <button type="button" className="modal-close" onClick={closeForm} aria-label="Close mental check form">×</button>
            </div>

            <form className="mental-check-form" onSubmit={handleSubmit}>
              <div className="mental-status-grid" aria-label="Choose how you feel">
                {MOODS.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={`mental-status-btn${mood === option.value ? ' selected' : ''}`}
                    style={{ '--mental-color': option.color }}
                    aria-pressed={mood === option.value}
                    disabled={saving}
                    onClick={() => setMood(option.value)}
                  >
                    <span className="status-dot" style={{ background: option.color }} />
                    {option.label}
                  </button>
                ))}
              </div>

              <label className="note-label mental-comment-label">
                Comment
                <textarea
                  className="note-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What is on your mind?"
                  rows={4}
                  maxLength={500}
                  disabled={saving}
                />
              </label>

              {error && <p className="reflection-error">{error}</p>}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeForm} disabled={saving}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save check'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
