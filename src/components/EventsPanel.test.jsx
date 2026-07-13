import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import EventsPanel from './EventsPanel';

const goal = { title: 'Test goal', startDate: '2026-06-01', endDate: '2026-06-10', totalDays: 10 };
const goalWithoutSpecialDays = { title: 'Test goal', startDate: '2026-03-01', endDate: '2026-03-05', totalDays: 5 };

describe('EventsPanel', () => {
  it('does not open the add event modal until the add button is used', () => {
    const html = renderToString(
      <EventsPanel goal={goalWithoutSpecialDays} events={[]} onChange={vi.fn()} />,
    );

    expect(html).toContain('Events &amp; special days');
    expect(html).toContain('No events or special days on this goal');
    expect(html).not.toContain('Add event</h2>');
  });

  it('lists a saved event alongside a built-in special day within the goal range', () => {
    const html = renderToString(
      <EventsPanel
        goal={goal}
        events={[
          {
            id: 'event-1',
            text: 'Road trip',
            color: '#22c55e',
            startDate: '2026-06-01',
            endDate: '2026-06-02',
            createdAt: '2026-05-01T00:00:00.000Z',
            updatedAt: '2026-05-01T00:00:00.000Z',
          },
        ]}
        onChange={vi.fn()}
      />,
    );

    expect(html).toContain('Road trip');
    expect(html).toContain('2026-06-01 → 2026-06-02');
    expect(html).toContain('Vacation');
    expect(html).toContain('2026-06-04');
    expect(html).toContain('aria-label="Edit event Road trip"');
    expect(html).toContain('aria-label="Remove event Road trip"');
  });

  it('paginates events and special days at 5 rows per page', () => {
    const events = Array.from({ length: 6 }, (_, i) => ({
      id: `event-${i}`,
      text: `Event ${i}`,
      color: '#22c55e',
      startDate: `2026-06-${String(i + 1).padStart(2, '0')}`,
      endDate: `2026-06-${String(i + 1).padStart(2, '0')}`,
      createdAt: '2026-05-01T00:00:00.000Z',
      updatedAt: '2026-05-01T00:00:00.000Z',
    }));

    const html = renderToString(
      <EventsPanel goal={goalWithoutSpecialDays} events={events} onChange={vi.fn()} />,
    );

    expect(html).toContain('Event 0');
    expect(html).toContain('Event 4');
    expect(html).not.toContain('Event 5');
    expect(html).toContain('pg-info');
    expect(html).toContain('of <!-- -->6');
    expect(html).toContain('aria-label="Go to events page 2"');
  });
});
