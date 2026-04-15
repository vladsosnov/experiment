import { useMemo, useState } from 'react';
import { dateRange } from '../utils/dates';

export default function AllTodos({ goal, days }) {
  const [filter, setFilter] = useState('pending'); // 'all' | 'pending' | 'completed'

  const todos = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    const items = [];

    allDates.forEach((dateStr, idx) => {
      const data = days[dateStr];
      if (data?.todos && data.todos.length > 0) {
        data.todos.forEach((todo) => {
          items.push({
            ...todo,
            dateStr,
            dayNumber: idx + 1,
          });
        });
      }
    });

    return items;
  }, [goal, days]);

  const filtered = useMemo(() => {
    if (filter === 'pending') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  if (todos.length === 0) return null;

  const pendingCount = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="all-todos-section">
      <div className="all-todos-header">
        <span className="all-todos-title">All TODOs</span>
        <div className="all-todos-filters">
          <button
            className={`all-todos-filter${filter === 'all' ? ' active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({todos.length})
          </button>
          <button
            className={`all-todos-filter${filter === 'pending' ? ' active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`all-todos-filter${filter === 'completed' ? ' active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      <div className="all-todos-list">
        {filtered.length === 0 ? (
          <p className="all-todos-empty">No {filter} todos</p>
        ) : (
          filtered.map((todo) => (
            <div key={`${todo.dateStr}-${todo.id}`} className={`all-todos-item${todo.completed ? ' completed' : ''}`}>
              <span className={`all-todos-status ${todo.completed ? 'done' : 'pending'}`}>
                {todo.completed ? '✓' : '○'}
              </span>
              <span className="all-todos-text">{todo.text}</span>
              <span className="all-todos-meta">
                Day {todo.dayNumber} · {todo.dateStr}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
