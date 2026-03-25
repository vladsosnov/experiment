import { useEffect, useRef, useState } from 'react';
import { STATUS_COLORS } from './statusColors';

const STATUSES = ['green', 'blue', 'yellow', 'red'];
const KEY_MAP = { '1': 'green', '2': 'blue', '3': 'yellow', '4': 'red' };

export default function DayModal({ dateStr, dayNumber, data, onSave, onClose }) {
  const [status, setStatus] = useState(data?.status ?? null);
  const [note, setNote] = useState(data?.note ?? '');
  const noteRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (KEY_MAP[e.key]) { setStatus(KEY_MAP[e.key]); return; }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  function handleSave() {
    onSave(dateStr, { status, note: note.trim() });
    onClose();
  }

  function handleClear() {
    onSave(dateStr, null);
    onClose();
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`Log day ${dayNumber}`}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2>Day {dayNumber}</h2>
            <span className="modal-date">{dateStr}</span>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="modal-hint">Click a color or press <kbd>1</kbd>–<kbd>4</kbd></p>

        <div className="status-grid">
          {STATUSES.map((s, i) => (
            <button
              key={s}
              className={`status-btn${status === s ? ' selected' : ''}`}
              style={{ '--color': STATUS_COLORS[s].bg }}
              onClick={() => setStatus(s)}
            >
              <span className="status-dot" style={{ background: STATUS_COLORS[s].bg }} />
              <span className="status-label">{STATUS_COLORS[s].label}</span>
              <kbd className="status-key">{i + 1}</kbd>
            </button>
          ))}
        </div>

        <label className="note-label">
          Note
          <textarea
            ref={noteRef}
            className="note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How was this day? (required)"
            rows={3}
            maxLength={300}
          />
        </label>

        <div className="modal-actions">
          {data && (
            <button className="btn-ghost" onClick={handleClear}>
              Clear day
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={!status || !note.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
