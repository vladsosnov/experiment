import { describe, expect, it } from 'vitest';
import {
  addSubtaskToTodo,
  countCompletedTodoItems,
  countIncompleteTodos,
  countTodoItems,
  deleteSubtaskFromTodo,
  groupTodosByCompletion,
  reorderTodos,
  toggleSubtaskCompletion,
  toggleTodoCompletion,
  updateSubtaskText,
} from './todos';

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

  it('counts incomplete subtasks instead of double-counting their parent todo', () => {
    expect(countIncompleteTodos([
      {
        id: 1,
        text: 'Discuss app',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about name', completed: false },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
      {
        id: 2,
        text: 'Standalone',
        completed: false,
      },
    ])).toBe(2);
  });
});

describe('countTodoItems', () => {
  it('counts subtasks as actionable items instead of counting their parent todo', () => {
    expect(countTodoItems([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: false },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
      { id: 2, text: 'Standalone', completed: false },
    ])).toBe(3);
  });
});

describe('countCompletedTodoItems', () => {
  it('counts completed subtasks and completed standalone parent todos', () => {
    expect(countCompletedTodoItems([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: false },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
      { id: 2, text: 'Standalone', completed: true },
    ])).toBe(2);
  });
});

describe('toggleTodoCompletion', () => {
  it('checking a parent todo completes all subtasks', () => {
    const next = toggleTodoCompletion([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: false },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
    ], 1);

    expect(next[0].completed).toBe(true);
    expect(next[0].subtasks.map((subtask) => subtask.completed)).toEqual([true, true]);
  });

  it('unchecking a parent todo makes all subtasks pending', () => {
    const next = toggleTodoCompletion([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: true,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: true },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
    ], 1);

    expect(next[0].completed).toBe(false);
    expect(next[0].subtasks.map((subtask) => subtask.completed)).toEqual([false, false]);
  });
});

describe('toggleSubtaskCompletion', () => {
  it('checking the final pending subtask completes the parent todo', () => {
    const next = toggleSubtaskCompletion([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: true },
          { id: 12, text: 'Ask about promo package', completed: false },
        ],
      },
    ], 1, 12);

    expect(next[0].completed).toBe(true);
    expect(next[0].subtasks[1].completed).toBe(true);
  });

  it('unchecking any subtask makes the parent todo pending', () => {
    const next = toggleSubtaskCompletion([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: true,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: true },
          { id: 12, text: 'Ask about promo package', completed: true },
        ],
      },
    ], 1, 11);

    expect(next[0].completed).toBe(false);
    expect(next[0].subtasks[0].completed).toBe(false);
  });
});

describe('addSubtaskToTodo', () => {
  it('adding a pending subtask to a completed parent makes the parent pending', () => {
    const next = addSubtaskToTodo([
      { id: 1, text: '1-1 with Rafal manager', completed: true },
    ], 1, { id: 11, text: 'Ask about app name', completed: false });

    expect(next[0]).toMatchObject({
      id: 1,
      completed: false,
      subtasks: [{ id: 11, text: 'Ask about app name', completed: false }],
    });
  });
});

describe('deleteSubtaskFromTodo', () => {
  it('deleting the last pending subtask completes the parent when remaining subtasks are complete', () => {
    const next = deleteSubtaskFromTodo([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: true },
          { id: 12, text: 'Ask about promo package', completed: false },
        ],
      },
    ], 1, 12);

    expect(next[0].completed).toBe(true);
    expect(next[0].subtasks).toEqual([{ id: 11, text: 'Ask about app name', completed: true }]);
  });

  it('deleting all subtasks leaves the parent completion state unchanged', () => {
    const next = deleteSubtaskFromTodo([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: true,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: true },
        ],
      },
    ], 1, 11);

    expect(next[0].completed).toBe(true);
    expect(next[0].subtasks).toEqual([]);
  });
});

describe('updateSubtaskText', () => {
  it('updates subtask text when the edited text is not blank', () => {
    const next = updateSubtaskText([
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: false },
        ],
      },
    ], 1, 11, 'Ask about product name');

    expect(next[0].subtasks[0].text).toBe('Ask about product name');
  });

  it('keeps existing subtask text when the edited text is blank', () => {
    const todos = [
      {
        id: 1,
        text: '1-1 with Rafal manager',
        completed: false,
        subtasks: [
          { id: 11, text: 'Ask about app name', completed: false },
        ],
      },
    ];

    expect(updateSubtaskText(todos, 1, 11, '   ')).toBe(todos);
  });
});
