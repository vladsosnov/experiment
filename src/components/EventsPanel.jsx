import React, { useMemo, useState } from 'react';
import { listSpecialDaysInRange } from '../utils/dayAppearance';

const EMPTY_EVENTS = [];
const PAGE_SIZE = 5;
const PRESET_COLORS = [
  { label: 'Vacation', color: '#2193c4' },
  { label: 'Day for me', color: '#f97316' },
  { label: 'Birthday', color: '#cb47e6' },
];

function createEventId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function sortEvents(events) {
  return events.toSorted((a, b) => a.startDate.localeCompare(b.startDate));
}

function getInitialForm(event, goal) {
  return {
    text: event?.text ?? '',
    startDate: event?.startDate ?? goal.startDate,
    endDate: event?.endDate ?? goal.startDate,
    color: event?.color ?? PRESET_COLORS[0].color,
  };
}

export default function EventsPanel({ goal, events = EMPTY_EVENTS, onChange }) {
  const [page, setPage] = useState(1);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedEvents = useMemo(() => sortEvents(events), [events]);
  const specialDays = useMemo(
    () => listSpecialDaysInRange(goal.startDate, goal.endDate),
    [goal.startDate, goal.endDate],
  );
  const rows = useMemo(() => [
    ...sortedEvents.map((event) => ({ type: 'event', event })),
    ...specialDays.map((day) => ({ type: 'specialDay', day })),
  ], [sortedEvents, specialDays]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const isEditing = Boolean(editingEvent);
  const formOpen = form !== null;

  function openNewForm() {
    setEditingEvent(null);
    setForm(getInitialForm(null, goal));
    setError('');
    setSaving(false);
  }

  function openEditForm(event) {
    setEditingEvent(event);
    setForm(getInitialForm(event, goal));
    setError('');
    setSaving(false);
  }

  function closeForm() {
    setEditingEvent(null);
    setForm(null);
    setError('');
    setSaving(false);
  }

  async function handleDelete(event) {
    if (!confirm(`Remove the "${event.text}" event?`)) return;
    await onChange(events.filter((e) => e.id !== event.id));
    setPage(1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const text = form.text.trim();
    if (!text) {
      setError('Give the event a preview text.');
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError('Pick a start and end date.');
      return;
    }
    if (form.endDate < form.startDate) {
      setError('End date must be on or after the start date.');
      return;
    }

    const endDate = form.endDate;
    const timestamp = new Date().toISOString();
    const next = isEditing
      ? events.map((event) => (event.id === editingEvent.id
        ? { ...event, text, color: form.color, startDate: form.startDate, endDate, updatedAt: timestamp }
        : event))
      : [
        ...events,
        {
          id: createEventId(),
          text,
          color: form.color,
          startDate: form.startDate,
          endDate,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ];

    setSaving(true);
    setError('');
    try {
      await onChange(sortEvents(next));
      setPage(1);
      closeForm();
    } catch {
      setError('Could not save this event. Try again.');
      setSaving(false);
    }
  }

  return (
    <div className="events-section">
      <div className="notes-header events-header">
        <div>
          <span className="notes-title">Events &amp; special days</span>
          <span className="reflections-subtitle">Highlights on the board for this goal</span>
        </div>
        <div className="reflections-header-actions">
          <span className="notes-count">{sortedEvents.length} event{sortedEvents.length === 1 ? '' : 's'}</span>
          <button
            type="button"
            className="reflection-add-btn"
            onClick={openNewForm}
            aria-label="Add event"
            title="Add event"
          >
            +
          </button>
        </div>
      </div>

      <ul className="events-list">
        {rows.length === 0 ? (
          <li className="events-empty">No events or special days on this goal</li>
        ) : (
          pageRows.map((row) => (
            row.type === 'event' ? (
              <li key={`event-${row.event.id}`} className="events-list-item">
                <span className="event-swatch" style={{ background: row.event.color }} />
                <span className="event-item-text">{row.event.text}</span>
                <span className="event-item-range">
                  {row.event.startDate === row.event.endDate
                    ? row.event.startDate
                    : `${row.event.startDate} → ${row.event.endDate}`}
                </span>
                <span className="event-item-actions">
                  <button
                    type="button"
                    className="reflection-icon-btn"
                    onClick={() => openEditForm(row.event)}
                    aria-label={`Edit event ${row.event.text}`}
                    title="Edit event"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="reflection-icon-btn"
                    onClick={() => handleDelete(row.event)}
                    aria-label={`Remove event ${row.event.text}`}
                    title="Remove event"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ) : (
              <li key={`special-${row.day.date}`} className="events-list-item events-list-item-readonly">
                <span className="event-swatch" style={{ background: row.day.bg }} />
                <span className="event-item-text">{row.day.label}</span>
                <span className="event-item-range">{row.day.date}</span>
              </li>
            )
          ))
        )}
      </ul>

      {totalPages > 1 && (
        <div className="notes-pagination">
          <button
            type="button"
            className="pg-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
            aria-label="Previous events page"
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
                aria-label={`Go to events page ${n}`}
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
            aria-label="Next events page"
          >
            →
          </button>

          <span className="pg-info">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
          </span>
        </div>
      )}

      {formOpen && (
        <div className="modal-overlay" role="presentation" onMouseDown={closeForm}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{isEditing ? 'Edit event' : 'Add event'}</h2>
                <span className="modal-date">{form.startDate} → {form.endDate}</span>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeForm}
                aria-label="Close event form"
              >
                ×
              </button>
            </div>

            <form className="edit-form" onSubmit={handleSubmit}>
              <label className="edit-label">
                Preview text
                <input
                  type="text"
                  className="edit-input"
                  value={form.text}
                  disabled={saving}
                  placeholder="e.g. Road trip"
                  onChange={(e) => setForm((current) => ({ ...current, text: e.target.value }))}
                />
              </label>

              <div className="edit-date-row">
                <label className="edit-label">
                  Start date
                  <input
                    type="date"
                    className="edit-input"
                    value={form.startDate}
                    disabled={saving}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      setForm((current) => ({
                        ...current,
                        startDate,
                        endDate: current.endDate < startDate ? startDate : current.endDate,
                      }));
                    }}
                  />
                </label>
                <label className="edit-label">
                  End date
                  <input
                    type="date"
                    className="edit-input"
                    value={form.endDate}
                    min={form.startDate}
                    disabled={saving}
                    onChange={(e) => setForm((current) => ({ ...current, endDate: e.target.value }))}
                  />
                </label>
              </div>

              <label className="edit-label">
                Color
                <div className="event-color-row">
                  <input
                    type="color"
                    className="event-color-input"
                    value={form.color}
                    disabled={saving}
                    onChange={(e) => setForm((current) => ({ ...current, color: e.target.value }))}
                  />
                  {PRESET_COLORS.map((preset) => (
                    <button
                      type="button"
                      key={preset.color}
                      className={`event-color-preset${form.color === preset.color ? ' active' : ''}`}
                      style={{ background: preset.color }}
                      disabled={saving}
                      aria-label={`Use ${preset.label} color`}
                      title={preset.label}
                      onClick={() => setForm((current) => ({ ...current, color: preset.color }))}
                    />
                  ))}
                </div>
              </label>

              {error && <p className="error">{error}</p>}

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
    </div>
  );
}
