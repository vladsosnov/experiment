import { useEffect, useRef, useState } from 'react';
import { STATUS_COLORS } from './statusColors';
import { isWeekend } from '../utils/dates';
import { reorderTodos } from '../utils/todos';

const STATUSES = ['green', 'blue', 'yellow', 'red'];
const KEY_MAP = { '1': 'green', '2': 'blue', '3': 'yellow', '4': 'red' };

export default function DayModal({ dateStr, dayNumber, data, onSave, onClose }) {
  const [status, setStatus] = useState(data?.status ?? null);
  const [note, setNote] = useState(data?.note ?? '');
  const [todos, setTodos] = useState(data?.todos ?? []);
  const [newTodo, setNewTodo] = useState('');
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [draggedTodoId, setDraggedTodoId] = useState(null);
  const [workedWeekend, setWorkedWeekend] = useState(data?.workedWeekend ?? false);
  const noteRef = useRef(null);

  const isWeekendDay = isWeekend(dateStr);

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
    const hasStatus = status !== null;
    if (hasStatus && !note.trim()) return;
    onSave(dateStr, { status, note: note.trim(), todos, workedWeekend: isWeekendDay ? workedWeekend : false });
    onClose();
  }

  function handleStartEditTodo(todo) {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  }

  function handleConfirmEditTodo(id) {
    if (!editingTodoText.trim()) return;
    setTodos(todos.map(t => t.id === id ? { ...t, text: editingTodoText.trim() } : t));
    setEditingTodoId(null);
  }

  function handleAddTodo() {
    if (!newTodo.trim()) return;
    setTodos([...todos, { id: Date.now(), text: newTodo.trim(), completed: false }]);
    setNewTodo('');
  }

  function handleToggleTodo(id) {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }

  function handleDeleteTodo(id) {
    setTodos(todos.filter(t => t.id !== id));
  }

  function handleDragStartTodo(id) {
    setDraggedTodoId(id);
  }

  function handleDropTodo(targetId) {
    if (draggedTodoId === null) return;
    setTodos((currentTodos) => reorderTodos(currentTodos, draggedTodoId, targetId));
    setDraggedTodoId(null);
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

        {isWeekendDay && (
          <div className="weekend-section">
            <label className="weekend-checkbox-label">
              <input
                type="checkbox"
                className="weekend-checkbox"
                checked={workedWeekend}
                onChange={(e) => setWorkedWeekend(e.target.checked)}
              />
              <span className="weekend-text">I worked during this weekend</span>
            </label>
          </div>
        )}

        <div className="status-grid">
          {STATUSES.map((s, i) => (
            <button
              key={s}
              className={`status-btn${status === s ? ' selected' : ''}`}
              style={{ '--color': STATUS_COLORS[s].bg }}
              onClick={() => setStatus(status === s ? null : s)}
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

        <div className="todo-section">
          <h3 className="todo-title">TODOs</h3>
          <div className="todo-input-row">
            <input
              type="text"
              className="todo-input"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              placeholder="Add a todo item..."
            />
            <button className="btn-add-todo" onClick={handleAddTodo} disabled={!newTodo.trim()}>
              +
            </button>
          </div>
          {todos.length > 0 && (
            <ul className="todo-list">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item${todo.completed ? ' completed' : ''}${draggedTodoId === todo.id ? ' dragging' : ''}`}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropTodo(todo.id)}
                >
                  <button
                    type="button"
                    className="todo-drag-handle"
                    draggable
                    aria-label={`Drag todo ${todo.text}`}
                    onDragStart={() => handleDragStartTodo(todo.id)}
                    onDragEnd={() => setDraggedTodoId(null)}
                  >
                    ⋮⋮
                  </button>
                  <input
                    type="checkbox"
                    className="todo-checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleTodo(todo.id)}
                  />
                  {editingTodoId === todo.id ? (
                    <input
                      className="todo-input todo-edit-input"
                      value={editingTodoText}
                      onChange={(e) => setEditingTodoText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmEditTodo(todo.id);
                        if (e.key === 'Escape') setEditingTodoId(null);
                      }}
                      onBlur={() => handleConfirmEditTodo(todo.id)}
                      autoFocus
                    />
                  ) : (
                    <span className="todo-text" onDoubleClick={() => handleStartEditTodo(todo)}>
                      {todo.text}
                    </span>
                  )}
                  <button className="btn-delete-todo" onClick={() => handleDeleteTodo(todo.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          {data && (
            <button className="btn-ghost" onClick={handleClear}>
              Clear day
            </button>
          )}
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={status && !note.trim()}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
