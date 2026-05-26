import { describe, expect, it } from 'vitest';
import { countIncompleteTodos, groupTodosByCompletion, reorderTodos } from './todos';

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

  it('keeps completed todos after pending todos after a reorder', () => {
    const mixedTodos = [
      { id: 1, text: 'First', completed: false },
      { id: 2, text: 'Second', completed: true },
      { id: 3, text: 'Third', completed: false },
      { id: 4, text: 'Fourth', completed: true },
    ];

    expect(reorderTodos(mixedTodos, 4, 1).map((todo) => todo.id)).toEqual([1, 3, 4, 2]);
  });
});

describe('groupTodosByCompletion', () => {
  it('moves completed todos to the end while preserving relative order within each group', () => {
    const todos = [
      { id: 1, text: 'First', completed: true },
      { id: 2, text: 'Second', completed: false },
      { id: 3, text: 'Third', completed: true },
      { id: 4, text: 'Fourth', completed: false },
    ];

    expect(groupTodosByCompletion(todos).map((todo) => todo.id)).toEqual([2, 4, 1, 3]);
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
