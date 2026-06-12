import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { todayString } from '../utils/dates';
import { withReflectionResult } from './selfReflectionsModel';

const PAGE_SIZE = 7;
const EMPTY_REFLECTIONS = [];

function createReflectionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortReflections(reflections) {
  return reflections.toSorted((a, b) => {
    if (a.date !== b.date) return b.date.localeCompare(a.date);
    return (b.updatedAt ?? b.createdAt ?? '').localeCompare(a.updatedAt ?? a.createdAt ?? '');
  });
}

function getInitialForm(reflection) {
  return {
    date: reflection?.date ?? todayString(),
    text: reflection?.text ?? '',
  };
}

export default function SelfReflections({ reflections = EMPTY_REFLECTIONS, onChange }) {
  const [page, setPage] = useState(1);
  const [editingReflection, setEditingReflection] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [resultReflection, setResultReflection] = useState(null);
  const [resultForm, setResultForm] = useState(null);
  const [resultError, setResultError] = useState('');
  const [resultSaving, setResultSaving] = useState(false);

  const sortedRows = useMemo(() => sortReflections(reflections), [reflections]);
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = sortedRows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEditing = Boolean(editingReflection);
  const formOpen = form !== null;
  const resultFormOpen = resultForm !== null;
  const isEditingResult = Boolean(resultReflection?.result);

  useEffect(() => {
    if (!formOpen && !resultFormOpen) return undefined;

    function handleKeyDown(e) {
      if (e.key !== 'Escape') return;
      setEditingReflection(null);
      setForm(null);
      setError('');
      setSaving(false);
      setResultReflection(null);
      setResultForm(null);
      setResultError('');
      setResultSaving(false);
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formOpen, resultFormOpen]);

  function openNewForm() {
    closeResultForm();
    setEditingReflection(null);
    setForm(getInitialForm(null));
    setError('');
    setSaving(false);
  }

  function openEditForm(reflection) {
    closeResultForm();
    setEditingReflection(reflection);
    setForm(getInitialForm(reflection));
    setError('');
    setSaving(false);
  }

  function closeForm() {
    setEditingReflection(null);
    setForm(null);
    setError('');
    setSaving(false);
  }

  function openResultForm(reflection) {
    closeForm();
    setResultReflection(reflection);
    setResultForm({ result: reflection.result ?? '' });
    setResultError('');
    setResultSaving(false);
  }

  function closeResultForm() {
    setResultReflection(null);
    setResultForm(null);
    setResultError('');
    setResultSaving(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = form.text.trim();
    if (!form.date) {
      setError('Pick a date for this reflection.');
      return;
    }
    if (!text) {
      setError('Write the thought before saving.');
      return;
    }

    const timestamp = new Date().toISOString();
    let next;
    if (isEditing) {
      next = reflections.map((reflection) => (
        reflection.id === editingReflection.id
          ? { ...reflection, date: form.date, text, updatedAt: timestamp }
          : reflection
      ));
    } else {
      next = [
        ...reflections,
        {
          id: createReflectionId(),
          date: form.date,
          text,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];
    }

    setSaving(true);
    setError('');
    try {
      await onChange(sortReflections(next));
      setPage(1);
      closeForm();
    } catch {
      setError('Could not save this reflection. Try again.');
      setSaving(false);
    }
  }

  async function handleSubmitResult(e) {
    e.preventDefault();
    const result = resultForm.result.trim();
    if (!result) {
      setResultError('Write the result before saving.');
      return;
    }

    const timestamp = new Date().toISOString();
    const next = withReflectionResult(reflections, resultReflection.id, result, timestamp);

    setResultSaving(true);
    setResultError('');
    try {
      await onChange(sortReflections(next));
      closeResultForm();
    } catch {
      setResultError('Could not save this result. Try again.');
      setResultSaving(false);
    }
  }

  return (
    <div className="reflections-section">
      <div className="notes-header reflections-header">
        <div>
          <span className="notes-title">Self reflections</span>
          <span className="reflections-subtitle">Thoughts to revisit with a clearer head</span>
        </div>
        <div className="reflections-header-actions">
          <span className="notes-count">{sortedRows.length} entr{sortedRows.length === 1 ? 'y' : 'ies'}</span>
          <button
            type="button"
            className="reflection-add-btn"
            onClick={openNewForm}
            aria-label="Add reflection"
            title="Add reflection"
          >
            +
          </button>
        </div>
      </div>

      <div className="notes-table-wrap">
        <table className="notes-table reflections-table">
          <thead>
            <tr>
              <th className="reflection-date-col">Date</th>
              <th>Reflection</th>
              <th>Result</th>
              <th className="reflection-actions-col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={4} className="nt-empty">No reflections yet</td>
              </tr>
            ) : pageRows.map((reflection) => (
              <tr key={reflection.id}>
                <td className="reflection-date-col">{reflection.date}</td>
                <td>
                  <span className="reflection-text">{reflection.text}</span>
                </td>
                <td>
                  {reflection.result ? (
                    <span className="reflection-result-text">{reflection.result}</span>
                  ) : (
                    <span className="reflection-result-empty">No result yet</span>
                  )}
                </td>
                <td className="reflection-actions-col">
                  <div className="reflection-row-actions">
                    <button
                      type="button"
                      className="reflection-icon-btn"
                      onClick={() => openEditForm(reflection)}
                      aria-label={`Edit reflection from ${reflection.date}`}
                      title="Edit reflection"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      className="reflection-icon-btn"
                      onClick={() => openResultForm(reflection)}
                      aria-label={`${reflection.result ? 'Edit' : 'Add'} result for reflection from ${reflection.date}`}
                      title={reflection.result ? 'Edit result' : 'Add result'}
                    >
                      {reflection.result ? '✎' : '+'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="notes-pagination">
          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous reflections page"
          >
            ←
          </button>

          <div className="pg-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                type="button"
                key={n}
                className={`pg-num${n === safePage ? ' active' : ''}`}
                onClick={() => setPage(n)}
                aria-label={`Go to reflections page ${n}`}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            aria-label="Next reflections page"
          >
            →
          </button>

          <span className="pg-info">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, sortedRows.length)} of {sortedRows.length}
          </span>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeForm}>
          <div className="modal reflection-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{isEditing ? 'Edit reflection' : 'Add reflection'}</h2>
                <span className="modal-date">{form.date}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                aria-label="Close reflection form"
              >
                ×
              </button>
            </div>

            <form className="reflection-form" onSubmit={handleSubmit}>
              <label className="edit-label">
                Date
                <input
                  type="date"
                  className="edit-input"
                  value={form.date}
                  disabled={saving}
                  onChange={(e) => setForm((current) => ({ ...current, date: e.target.value }))}
                />
              </label>

              <label className="edit-label">
                Reflection
                <textarea
                  className="edit-input reflection-textarea"
                  value={form.text}
                  disabled={saving}
                  onChange={(e) => setForm((current) => ({ ...current, text: e.target.value }))}
                  rows={6}
                />
              </label>

              {error && <p className="reflection-error">{error}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeForm} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {resultFormOpen && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeResultForm}>
          <div className="modal reflection-modal result-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{isEditingResult ? 'Edit result' : 'Add result'}</h2>
                <span className="modal-date">{resultReflection.date}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeResultForm}
                aria-label="Close result form"
              >
                ×
              </button>
            </div>

            <form className="reflection-form" onSubmit={handleSubmitResult}>
              <label className="edit-label">
                Result
                <textarea
                  className="edit-input reflection-textarea"
                  value={resultForm.result}
                  disabled={resultSaving}
                  onChange={(e) => setResultForm((current) => ({ ...current, result: e.target.value }))}
                  rows={5}
                />
              </label>

              {resultError && <p className="reflection-error">{resultError}</p>}

              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeResultForm} disabled={resultSaving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={resultSaving}>
                  {resultSaving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
