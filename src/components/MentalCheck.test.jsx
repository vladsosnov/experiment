import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import MentalCheck from './MentalCheck';
import { ensureDailyMentalCheck } from './mentalChecksModel';

describe('MentalCheck', () => {
  it('adds one unfilled check for the current local day', () => {
    const next = ensureDailyMentalCheck(
      [],
      new Date(2026, 6, 8, 9, 30),
      () => 'mental-2026-07-08',
    );

    expect(next).toEqual([{
      id: 'mental-2026-07-08',
      date: '2026-07-08',
      mood: null,
      comment: '',
      createdAt: new Date(2026, 6, 8, 9, 30).toISOString(),
    }]);
  });

  it('does not add a duplicate when a check already exists for today', () => {
    const checks = [{
      id: 'existing',
      mood: 'good',
      comment: 'A steady morning.',
      createdAt: new Date(2026, 6, 8, 7, 0).toISOString(),
    }];

    expect(ensureDailyMentalCheck(checks, new Date(2026, 6, 8, 18, 0))).toBe(checks);
  });

  it('starts with a closed form and an empty board message', () => {
    const html = renderToString(<MentalCheck checks={[]} onChange={vi.fn()} />);

    expect(html).toContain('Mental check');
    expect(html).toContain('No mental checks yet');
    expect(html).not.toContain('aria-label="Add mental check"');
    expect(html).not.toContain('mental-check-modal');
  });

  it('renders a clickable colored square without visible mood text', () => {
    const html = renderToString(
      <MentalCheck
        checks={[{
          id: 'm1',
          mood: 'sad',
          comment: 'I need a slower day.',
          createdAt: '2026-07-02T08:00:00.000Z',
        }]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain('mental-check-square');
    expect(html).toContain('--mental-color:#FA5053');
    expect(html).toContain('aria-label="Edit Sad - Jul 2');
    expect(html).toContain('I need a slower day.');
    expect(html).toContain('Jul 2');
    expect(html).not.toContain('mental-check-mood');
  });

  it('renders an unfilled daily square as ready for input', () => {
    const html = renderToString(
      <MentalCheck
        checks={[{
          id: 'm2',
          date: '2026-07-08',
          mood: null,
          comment: '',
          createdAt: '2026-07-08T08:00:00.000Z',
        }]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain('mental-check-square unfilled');
    expect(html).toContain('aria-label="Fill in mental check for Jul 8"');
    expect(html).not.toContain('aria-label="Add mental check"');
  });
});
