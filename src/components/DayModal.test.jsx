import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import DayModal from './DayModal';

describe('DayModal', () => {
  it('requires a note before saving a status on a plain day', () => {
    const html = renderToString(
      <DayModal
        dateStr="2026-06-10"
        dayNumber={1}
        data={{ status: 'green', note: '' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('How was this day? (required)');
    expect(html).toMatch(/class="btn-primary"[^>]*disabled=""/);
  });

  it('does not require a note before saving a status on a day covered by a custom event', () => {
    const html = renderToString(
      <DayModal
        dateStr="2026-06-10"
        dayNumber={1}
        data={{ status: 'green', note: '' }}
        event={{ color: '#22c55e', text: 'Road trip' }}
        onSave={vi.fn()}
        onClose={vi.fn()}
      />,
    );

    expect(html).toContain('How was this day? (optional)');
    expect(html).not.toMatch(/class="btn-primary"[^>]*disabled=""/);
  });
});
