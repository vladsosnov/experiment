import { afterEach, describe, expect, it, vi } from 'vitest';
import { createCompletedGoal, previewCompletedGoal } from './completedGoals';

afterEach(() => {
  vi.useRealTimers();
});

describe('createCompletedGoal', () => {
  it('creates a versioned JSON snapshot of all goal data', () => {
    const snapshot = createCompletedGoal(
      {
        goal: { title: 'Experiment', startDate: '2026-04-06', endDate: '2026-07-10' },
        days: { '2026-07-10': { status: 'green', note: 'Finished.' } },
        reflections: [{ id: 'r1', text: 'I stayed consistent.' }],
        mentalChecks: [{ id: 'm1', date: '2026-07-10', mood: 'great', comment: 'Proud.' }],
      },
      '2026-07-10T18:00:00.000Z',
      () => 'completed-experiment',
    );

    expect(snapshot).toEqual({
      version: 1,
      id: 'completed-experiment',
      status: 'completed',
      completedAt: '2026-07-10T18:00:00.000Z',
      goal: { title: 'Experiment', startDate: '2026-04-06', endDate: '2026-07-10' },
      days: { '2026-07-10': { status: 'green', note: 'Finished.' } },
      reflections: [{ id: 'r1', text: 'I stayed consistent.' }],
      mentalChecks: [{ id: 'm1', date: '2026-07-10', mood: 'great', comment: 'Proud.' }],
    });
  });

  it('opens a completed goal as a formatted JSON file', async () => {
    vi.useFakeTimers();
    let previewBlob;
    globalThis.URL.createObjectURL = vi.fn((blob) => {
      previewBlob = blob;
      return 'blob:completed-goal';
    });
    globalThis.URL.revokeObjectURL = vi.fn();
    const previewLink = { click: vi.fn() };
    globalThis.document = {
      createElement: vi.fn(() => previewLink),
    };
    const completedGoal = { id: 'completed-experiment', goal: { title: 'Experiment' } };

    previewCompletedGoal(completedGoal);

    expect(previewBlob.type).toBe('application/json');
    expect(JSON.parse(await previewBlob.text())).toEqual(completedGoal);
    expect(previewLink).toMatchObject({
      href: 'blob:completed-goal',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    expect(previewLink.click).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(60_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:completed-goal');
  });
});
