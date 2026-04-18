import { describe, expect, it } from 'vitest';
import { countIncompleteTodos, reorderTodos } from './todos';

describe('reorderTodos', () => {
  const todos = [
    { id: 1, text: 'First', completed: false },
    { id: 2, text: 'Second', completed: false },
    { id: 3, text: 'Third', completed: false },
  ];

  it('moves a todo before the drop target', () => {
    expect(reorderTodos(todos, 3, 1).map((todo) => todo.id)).toEqual([3, 1, 2]);
  });

  it('returns the same order when ids are missing or unchanged', () => {
    expect(reorderTodos(todos, 2, 2)).toBe(todos);
    expect(reorderTodos(todos, 9, 2)).toBe(todos);
    expect(reorderTodos(todos, 2, 9)).toBe(todos);
  });
});

describe('countIncompleteTodos', () => {
  it('counts only todos that are not completed', () => {
    expect(countIncompleteTodos([
      { id: 1, text: 'First', completed: false },
      { id: 2, text: 'Second', completed: true },
      { id: 3, text: 'Third', completed: false },
    ])).toBe(2);
  });

  it('returns zero for missing or empty todo lists', () => {
    expect(countIncompleteTodos()).toBe(0);
    expect(countIncompleteTodos([])).toBe(0);
  });
});
