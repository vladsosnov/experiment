import { useEffect, useRef, useState } from 'react';
import { STATUS_COLORS } from './statusColors';
import { isWeekend } from '../utils/dates';
import {
  addSubtaskToTodo,
  deleteSubtaskFromTodo,
  getSubtasks,
  groupTodosByCompletion,
  reorderTodos,
  toggleSubtaskCompletion,
  toggleTodoCompletion,
  updateSubtaskText,
} from '../utils/todos';

const STATUSES = ['green', 'blue', 'yellow', 'red'];
const KEY_MAP = { '1': 'green', '2': 'blue', '3': 'yellow', '4': 'red' };

export default function DayModal({ dateStr, dayNumber, data, onSave, onClose }) {
  const [status, setStatus] = useState(data?.status ?? null);
  const [note, setNote] = useState(data?.note ?? '');
  const [todos, setTodos] = useState(() => groupTodosByCompletion(data?.todos ?? []));
  const [newTodo, setNewTodo] = useState('');
  const [newSubtasks, setNewSubtasks] = useState({});
  const [addingSubtaskTodoId, setAddingSubtaskTodoId] = useState(null);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState('');
  const [editingSubtask, setEditingSubtask] = useState(null);
  const [editingSubtaskText, setEditingSubtaskText] = useState('');
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
    onSave(dateStr, {
      status,
      note: note.trim(),
      todos: groupTodosByCompletion(todos),
      workedWeekend: isWeekendDay ? workedWeekend : false,
    });
    onClose();
  }

  function handleStartEditTodo(todo) {
    setEditingTodoId(todo.id);
    setEditingTodoText(todo.text);
  }

  function handleConfirmEditTodo(id) {
    if (!editingTodoText.trim()) return;
    setTodos((currentTodos) => groupTodosByCompletion(
      currentTodos.map(t => t.id === id ? { ...t, text: editingTodoText.trim() } : t),
    ));
    setEditingTodoId(null);
  }

  function handleAddTodo() {
    if (!newTodo.trim()) return;
    setTodos((currentTodos) => groupTodosByCompletion([
      ...currentTodos,
      { id: Date.now(), text: newTodo.trim(), completed: false },
    ]));
    setNewTodo('');
  }

  function handleToggleTodo(id) {
    setTodos((currentTodos) => toggleTodoCompletion(currentTodos, id));
  }

  function handleDeleteTodo(id) {
    setTodos((currentTodos) => groupTodosByCompletion(currentTodos.filter(t => t.id !== id)));
  }

  function handleDragStartTodo(id) {
    setDraggedTodoId(id);
  }

  function handleDropTodo(targetId) {
    if (draggedTodoId === null) return;
    setTodos((currentTodos) => reorderTodos(currentTodos, draggedTodoId, targetId));
    setDraggedTodoId(null);
  }

  function handleSubtaskInputChange(todoId, value) {
    setNewSubtasks((current) => ({ ...current, [todoId]: value }));
  }

  function handleAddSubtask(todoId) {
    const text = newSubtasks[todoId]?.trim();
    if (!text) return;

    setTodos((currentTodos) => addSubtaskToTodo(currentTodos, todoId, {
      id: `${Date.now()}-${todoId}`,
      text,
      completed: false,
    }));
    setNewSubtasks((current) => {
      const next = { ...current };
      delete next[todoId];
      return next;
    });
    setAddingSubtaskTodoId(null);
  }

  function handleCancelAddSubtask(todoId) {
    setNewSubtasks((current) => {
      const next = { ...current };
      delete next[todoId];
      return next;
    });
    setAddingSubtaskTodoId(null);
  }

  function handleToggleSubtask(todoId, subtaskId) {
    setTodos((currentTodos) => toggleSubtaskCompletion(currentTodos, todoId, subtaskId));
  }

  function handleStartEditSubtask(todoId, subtask) {
    setEditingSubtask({ todoId, subtaskId: subtask.id });
    setEditingSubtaskText(subtask.text);
  }

  function handleConfirmEditSubtask() {
    if (!editingSubtask) return;
    if (!editingSubtaskText.trim()) return;

    setTodos((currentTodos) => updateSubtaskText(
      currentTodos,
      editingSubtask.todoId,
      editingSubtask.subtaskId,
      editingSubtaskText,
    ));
    setEditingSubtask(null);
    setEditingSubtaskText('');
  }

  function handleDeleteSubtask(todoId, subtaskId) {
    setTodos((currentTodos) => deleteSubtaskFromTodo(currentTodos, todoId, subtaskId));
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
          <button type="button" className="modal-close" onClick={onClose}>✕</button>
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
              type="button"
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
              aria-label="Add todo item"
            />
            <button
              type="button"
              className="btn-add-todo"
              onClick={handleAddTodo}
              disabled={!newTodo.trim()}
              aria-label="Add todo"
            >
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
                  <div className="todo-main-row">
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
                      aria-label={`Toggle todo ${todo.text}`}
                    />
                    {editingTodoId === todo.id ? (
                      <input
                        className="todo-input todo-edit-input"
                        value={editingTodoText}
                        onChange={(e) => setEditingTodoText(e.target.value)}
                        aria-label={`Edit todo ${todo.text}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleConfirmEditTodo(todo.id);
                          if (e.key === 'Escape') setEditingTodoId(null);
                        }}
                        onBlur={() => handleConfirmEditTodo(todo.id)}
                      />
                    ) : (
                      <span className="todo-text" onDoubleClick={() => handleStartEditTodo(todo)}>
                        {todo.text}
                      </span>
                    )}
                    <button
                      type="button"
                      className="btn-show-subtask-input"
                      onClick={() => setAddingSubtaskTodoId(todo.id)}
                      aria-label={`Add subtask to ${todo.text}`}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="btn-delete-todo"
                      onClick={() => handleDeleteTodo(todo.id)}
                      aria-label={`Delete todo ${todo.text}`}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="subtask-section">
                    {getSubtasks(todo).length > 0 && (
                      <ul className="subtask-list">
                        {getSubtasks(todo).map((subtask) => {
                          const isEditing = editingSubtask?.todoId === todo.id
                            && editingSubtask?.subtaskId === subtask.id;

                          return (
                            <li
                              key={subtask.id}
                              className={`subtask-item${subtask.completed ? ' completed' : ''}`}
                            >
                              <input
                                type="checkbox"
                                className="subtask-checkbox"
                                checked={subtask.completed}
                                onChange={() => handleToggleSubtask(todo.id, subtask.id)}
                                aria-label={`Toggle subtask ${subtask.text}`}
                              />
                              {isEditing ? (
                                <input
                                  className="todo-input subtask-edit-input"
                                  value={editingSubtaskText}
                                  onChange={(e) => setEditingSubtaskText(e.target.value)}
                                  aria-label={`Edit subtask ${subtask.text}`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleConfirmEditSubtask();
                                    if (e.key === 'Escape') {
                                      setEditingSubtask(null);
                                      setEditingSubtaskText('');
                                    }
                                  }}
                                  onBlur={handleConfirmEditSubtask}
                                />
                              ) : (
                                <span
                                  className="subtask-text"
                                  onDoubleClick={() => handleStartEditSubtask(todo.id, subtask)}
                                >
                                  {subtask.text}
                                </span>
                              )}
                              <button
                                type="button"
                                className="btn-delete-subtask"
                                onClick={() => handleDeleteSubtask(todo.id, subtask.id)}
                                aria-label={`Delete subtask ${subtask.text}`}
                                title="Delete subtask"
                              >
                                ✕
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}

                    {addingSubtaskTodoId === todo.id && (
                      <div className="subtask-input-row">
                        <input
                          type="text"
                          className="todo-input subtask-input"
                          value={newSubtasks[todo.id] ?? ''}
                          onChange={(e) => handleSubtaskInputChange(todo.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddSubtask(todo.id);
                            if (e.key === 'Escape') handleCancelAddSubtask(todo.id);
                          }}
                          placeholder="Add a subtask..."
                          aria-label={`Add subtask to ${todo.text}`}
                        />
                        <button
                          type="button"
                          className="btn-add-subtask"
                          onClick={() => handleAddSubtask(todo.id)}
                          disabled={!newSubtasks[todo.id]?.trim()}
                          aria-label={`Add subtask to ${todo.text}`}
                        >
                          +
                        </button>
                        <button
                          type="button"
                          className="btn-cancel-subtask"
                          onClick={() => handleCancelAddSubtask(todo.id)}
                          aria-label={`Cancel adding subtask to ${todo.text}`}
                          title="Cancel subtask"
                        >
                          -
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="modal-actions">
          <button
            type="button"
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
