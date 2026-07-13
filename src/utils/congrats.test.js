import { describe, expect, it } from 'vitest';
import { getCongratsStats, hasCompletedGoal, isDayFilled } from './congrats';

describe('isDayFilled', () => {
  it('returns false for a missing or empty day', () => {
    expect(isDayFilled(undefined)).toBe(false);
    expect(isDayFilled({})).toBe(false);
  });

  it('returns true when a status is logged', () => {
    expect(isDayFilled({ status: 'green' })).toBe(true);
  });

  it('returns true when all todos for the day are completed, even without a status', () => {
    expect(isDayFilled({
      todos: [
        { id: 1, text: 'First', completed: true },
        { id: 2, text: 'Second', completed: true },
      ],
    })).toBe(true);
  });

  it('returns false when todos exist but are not all completed', () => {
    expect(isDayFilled({
      todos: [
        { id: 1, text: 'First', completed: true },
        { id: 2, text: 'Second', completed: false },
      ],
    })).toBe(false);
  });
});

describe('hasCompletedGoal', () => {
  const goal = { startDate: '2026-04-06', endDate: '2026-04-18', totalDays: 13 };

  it('treats the goal as complete when the last day has all todos finished, without a status', () => {
    expect(hasCompletedGoal(goal, {
      '2026-04-18': {
        todos: [{ id: 1, text: 'Wrap up', completed: true }],
      },
    })).toBe(true);
  });

  it('treats the goal as incomplete when the last day has unfinished todos and no status', () => {
    expect(hasCompletedGoal(goal, {
      '2026-04-18': {
        todos: [{ id: 1, text: 'Wrap up', completed: false }],
      },
    })).toBe(false);
  });
});

describe('getCongratsStats', () => {
  it('counts a day with all todos completed as logged, even without a status', () => {
    const stats = getCongratsStats({
      '2026-04-16': { todos: [{ id: 1, text: 'Task', completed: true }] },
      '2026-04-17': { todos: [{ id: 2, text: 'Task', completed: false }] },
      '2026-04-18': { status: 'blue' },
    }, 13);

    expect(stats.loggedDays).toBe(2);
  });
});
