import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import MentalCheck from './MentalCheck';

describe('MentalCheck', () => {
  it('starts with a closed form and an empty board message', () => {
    const html = renderToString(<MentalCheck checks={[]} onChange={vi.fn()} />);

    expect(html).toContain('Mental check');
    expect(html).toContain('No mental checks yet');
    expect(html).toContain('aria-label="Add mental check"');
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
    expect(html).toContain('aria-label="Edit Sad — Jul 2');
    expect(html).toContain('I need a slower day.');
    expect(html).toContain('Jul 2');
    expect(html).not.toContain('mental-check-mood');
  });
});
