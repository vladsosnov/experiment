import { describe, expect, it } from 'vitest';
import {
  normalizeSavedDay,
  PLAN_NEXT_DAY_TODO_TEXT,
  applySeededPlanningTodo,
  shouldDismissSeededPlanningTodo,
} from './seededTodos';
import { getCongratsStats, hasCompletedGoal } from './congrats';

describe('applySeededPlanningTodo', () => {
  it('adds the seeded todo to every qualifying day in the goal range', () => {
    const goal = {
      startDate: '2026-04-06',
      endDate: '2026-04-18',
    };
    const days = {
      '2026-04-16': {
        todos: [{ id: 1, text: 'Existing', completed: false }],
      },
    };

    const next = applySeededPlanningTodo(goal, days);

    expect(next['2026-04-15']).toBeUndefined();
    expect(next['2026-04-16'].todos.map((todo) => todo.text)).toEqual([
      'Existing',
      PLAN_NEXT_DAY_TODO_TEXT,
    ]);
    expect(next['2026-04-17'].todos).toHaveLength(1);
    expect(next['2026-04-17'].todos[0].text).toBe(PLAN_NEXT_DAY_TODO_TEXT);
    expect(next['2026-04-18'].todos[0].text).toBe(PLAN_NEXT_DAY_TODO_TEXT);
  });

  it('does not duplicate the seeded todo when it already exists', () => {
    const goal = {
      startDate: '2026-04-06',
      endDate: '2026-04-18',
    };
    const days = {
      '2026-04-16': {
        todos: [
          { id: 1, text: PLAN_NEXT_DAY_TODO_TEXT, completed: true },
          { id: 2, text: 'Existing', completed: false },
        ],
      },
    };

    const next = applySeededPlanningTodo(goal, days);
    const seededTodos = next['2026-04-16'].todos.filter((todo) => todo.text === PLAN_NEXT_DAY_TODO_TEXT);

    expect(seededTodos).toHaveLength(1);
    expect(seededTodos[0].completed).toBe(true);
  });

  it('treats the goal as incomplete until the last day has a status', () => {
    const goal = {
      startDate: '2026-04-06',
      endDate: '2026-04-18',
      totalDays: 13,
    };
    const days = applySeededPlanningTodo(goal, {});

    expect(hasCompletedGoal(goal, days)).toBe(false);
    expect(hasCompletedGoal(goal, {
      ...days,
      '2026-04-18': {
        ...days['2026-04-18'],
        status: 'green',
      },
    })).toBe(true);
  });

  it('reports logged-day stats from statuses, not seeded empty days', () => {
    const stats = getCongratsStats({
      '2026-04-16': { todos: [{ id: 1, text: PLAN_NEXT_DAY_TODO_TEXT, completed: false }] },
      '2026-04-17': { status: 'green', todos: [{ id: 2, text: PLAN_NEXT_DAY_TODO_TEXT, completed: false }] },
      '2026-04-18': { status: 'blue' },
    }, 13);

    expect(stats.loggedDays).toBe(2);
    expect(stats.superDays).toBe(1);
    expect(stats.strongPct).toBe(15);
  });

  it('does not re-add the seeded todo after the user dismisses it for a day', () => {
    const goal = {
      startDate: '2026-04-06',
      endDate: '2026-04-18',
    };

    const next = applySeededPlanningTodo(goal, {
      '2026-04-18': {
        dismissSeededPlanningTodo: true,
        todos: [],
      },
    });

    expect(next['2026-04-18'].todos).toEqual([]);
  });

  it('marks the seeded todo as dismissed when it is removed from a qualifying day', () => {
    expect(shouldDismissSeededPlanningTodo('2026-04-18', {
      status: 'green',
      todos: [],
    })).toBe(true);

    expect(shouldDismissSeededPlanningTodo('2026-04-15', {
      status: 'green',
      todos: [],
    })).toBe(false);

    expect(shouldDismissSeededPlanningTodo('2026-04-18', {
      status: 'green',
      todos: [{ id: 1, text: PLAN_NEXT_DAY_TODO_TEXT, completed: false }],
    })).toBe(false);
  });

  it('keeps a dismissal record when the user removes the only seeded todo from an otherwise empty day', () => {
    expect(normalizeSavedDay('2026-04-18', {
      status: null,
      note: '',
      todos: [],
      workedWeekend: false,
    })).toEqual({
      dismissSeededPlanningTodo: true,
      todos: [],
    });
  });

  it('drops truly empty non-qualifying days', () => {
    expect(normalizeSavedDay('2026-04-15', {
      status: null,
      note: '',
      todos: [],
      workedWeekend: false,
    })).toBeNull();
  });
});
