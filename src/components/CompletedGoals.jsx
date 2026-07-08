import React, { useState } from 'react';
import { previewCompletedGoal } from '../utils/completedGoals';

function formatDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export default function CompletedGoals({ completedGoals, onBack }) {
  const [previewError, setPreviewError] = useState('');

  function handlePreview(completedGoal) {
    setPreviewError('');
    try {
      previewCompletedGoal(completedGoal);
    } catch (error) {
      setPreviewError(error.message);
    }
  }

  return (
    <main className="completed-goals-page">
      <header className="completed-goals-header">
        <button type="button" className="btn-ghost" onClick={onBack}>Back</button>
        <div>
          <h1>Completed goals</h1>
          <p>Every finished goal is preserved as a JSON snapshot.</p>
        </div>
      </header>

      {previewError && <p className="completed-goals-error">{previewError}</p>}

      {completedGoals.length === 0 ? (
        <section className="completed-goals-empty">
          <span aria-hidden="true">🏆</span>
          <h2>No completed goals yet</h2>
          <p>Your finished goals will appear here.</p>
        </section>
      ) : (
        <section className="completed-goals-list" aria-label="Completed goal archives">
          {completedGoals.map((completedGoal) => {
            const title = completedGoal.goal?.title || 'Untitled goal';
            const startDate = completedGoal.goal?.startDate;
            const endDate = completedGoal.goal?.endDate;
            const dateRangeLabel = startDate && endDate
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : '';

            return (
              <article className="completed-goal-card" key={completedGoal.id}>
                <div className="completed-goal-copy">
                  <div className="completed-goal-title-row">
                    <h2>{title}</h2>
                    <span className="completed-goal-format">JSON</span>
                  </div>
                  {dateRangeLabel && <p className="completed-goal-dates">{dateRangeLabel}</p>}
                  <p className="completed-goal-completed-at">
                    Completed {formatDate(completedGoal.completedAt?.slice(0, 10))}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn-primary completed-goal-preview"
                  aria-label={`Preview ${title} as JSON`}
                  onClick={() => handlePreview(completedGoal)}
                >
                  Preview
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
