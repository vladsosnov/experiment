import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import NotesTable from './NotesTable';

describe('NotesTable', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders current week rows from first day to last day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-12T12:00:00.000Z'));

    const days = {
      '2026-06-08': { status: 'green', note: 'Monday note' },
      '2026-06-09': { status: 'green', note: 'Tuesday note' },
      '2026-06-10': { status: 'green', note: 'Wednesday note' },
      '2026-06-11': { status: 'green', note: 'Thursday note' },
      '2026-06-12': { status: null, note: '' },
      '2026-06-13': { status: null, note: '' },
      '2026-06-14': { status: null, note: '' },
    };

    const html = renderToString(
      <NotesTable
        goal={{ startDate: '2026-06-08', endDate: '2026-06-14' }}
        days={days}
      />,
    );

    expect(html.indexOf('2026-06-08')).toBeLessThan(html.indexOf('2026-06-09'));
    expect(html.indexOf('2026-06-09')).toBeLessThan(html.indexOf('2026-06-10'));
    expect(html.indexOf('2026-06-10')).toBeLessThan(html.indexOf('2026-06-11'));
    expect(html.indexOf('2026-06-11')).toBeLessThan(html.indexOf('2026-06-12'));
    expect(html.indexOf('2026-06-12')).toBeLessThan(html.indexOf('2026-06-13'));
    expect(html.indexOf('2026-06-13')).toBeLessThan(html.indexOf('2026-06-14'));
  });
});
