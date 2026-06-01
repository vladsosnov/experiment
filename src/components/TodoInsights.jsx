import { useMemo } from 'react';
import { dateRange } from '../utils/dates';
import { countCompletedTodoItems, countIncompleteTodos, countTodoItems } from '../utils/todos';

export default function TodoInsights({ goal, days }) {
  const insights = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    let totalTodos = 0;
    let completedTodos = 0;
    let incompleteTodos = 0;

    allDates.forEach((dateStr) => {
      const data = days[dateStr];
      if (data?.todos && data.todos.length > 0) {
        const dayIncomplete = countIncompleteTodos(data.todos);
        const dayComplete = countCompletedTodoItems(data.todos);
        const dayTotal = countTodoItems(data.todos);

        totalTodos += dayTotal;
        completedTodos += dayComplete;
        incompleteTodos += dayIncomplete;
      }
    });

    return {
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
    </div>
  );
}
