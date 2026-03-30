import { useMemo } from 'react';
import { dateRange } from '../utils/dates';

export default function TodoInsights({ goal, days }) {
  const insights = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    const daysWithTodos = [];
    let totalTodos = 0;
    let completedTodos = 0;
    let incompleteTodos = 0;

    allDates.forEach((dateStr, idx) => {
      const data = days[dateStr];
      if (data?.todos && data.todos.length > 0) {
        const dayIncomplete = data.todos.filter(t => !t.completed).length;
        const dayComplete = data.todos.filter(t => t.completed).length;

        if (dayIncomplete > 0) {
          daysWithTodos.push({
            dateStr,
            dayNumber: idx + 1,
            incomplete: dayIncomplete,
            total: data.todos.length,
          });
        }

        totalTodos += data.todos.length;
        completedTodos += dayComplete;
        incompleteTodos += dayIncomplete;
      }
    });

    return {
      daysWithTodos,
      totalTodos,
      completedTodos,
      incompleteTodos,
      completionRate: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
    };
  }, [goal, days]);

  if (insights.totalTodos === 0) {
    return null; // Don't show if no todos exist
  }

  return (
    <div className="todo-insights-section">
      <div className="todo-insights-header">
        <span className="todo-insights-title">📋 Todo Insights</span>
      </div>

      <div className="todo-stats-grid">
        <div className="todo-stat-card">
          <span className="todo-stat-value">{insights.incompleteTodos}</span>
          <span className="todo-stat-label">Pending</span>
        </div>
        <div className="todo-stat-card">
          <span className="todo-stat-value">{insights.completedTodos}</span>
          <span className="todo-stat-label">Completed</span>
        </div>
        <div className="todo-stat-card">
          <span className="todo-stat-value">{insights.completionRate}%</span>
          <span className="todo-stat-label">Done</span>
        </div>
      </div>

      {insights.daysWithTodos.length > 0 && (
        <div className="todo-upcoming">
          <h4 className="todo-upcoming-title">Days with pending todos</h4>
          <div className="todo-upcoming-list">
            {insights.daysWithTodos.map(({ dateStr, dayNumber, incomplete, total }) => (
              <div key={dateStr} className="todo-upcoming-item">
                <span className="todo-upcoming-day">Day {dayNumber}</span>
                <span className="todo-upcoming-date">{dateStr}</span>
                <span className="todo-upcoming-count">
                  {incomplete} / {total} pending
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
