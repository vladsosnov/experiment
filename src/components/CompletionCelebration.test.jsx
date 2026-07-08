import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import CompletionCelebration from './CompletionCelebration';

describe('CompletionCelebration', () => {
  it('celebrates the completed goal and prepares the next-goal action', () => {
    const html = renderToString(
      <CompletionCelebration
        completedGoal={{
          goal: { title: 'Experiment', totalDays: 2 },
          days: {
            '2026-07-09': { status: 'green' },
            '2026-07-10': { status: 'blue' },
          },
        }}
        onContinue={vi.fn()}
      />,
    );

    expect(html).toContain('Goal complete!');
    expect(html).toContain('Experiment');
    expect(html).toContain('<strong>2</strong><span>days logged</span>');
    expect(html).toContain('Get ready for a new goal');
    expect(html).toContain('disabled=""');
  });
});
