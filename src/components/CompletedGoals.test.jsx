import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CompletedGoals from './CompletedGoals';

describe('CompletedGoals', () => {
  it('renders archived goals with a JSON preview action', () => {
    const html = renderToString(
      <CompletedGoals
        completedGoals={[{
          id: 'completed-experiment',
          completedAt: '2026-07-10T18:00:00.000Z',
          goal: {
            title: 'Experiment',
            startDate: '2026-04-06',
            endDate: '2026-07-10',
          },
          days: {},
          reflections: [],
          mentalChecks: [],
        }]}
        onBack={vi.fn()}
      />,
    );

    expect(html).toContain('Completed goals');
    expect(html).toContain('Experiment');
    expect(html).toContain('Apr 6, 2026 - Jul 10, 2026');
    expect(html).toContain('aria-label="Preview Experiment as JSON"');
  });
});
