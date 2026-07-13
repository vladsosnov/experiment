import { describe, expect, it } from 'vitest';
import { eventCoversDate, getEventForDate } from './events';

const tripEvent = {
  id: 'trip',
  text: 'Road trip',
  color: '#22c55e',
  startDate: '2026-06-04',
  endDate: '2026-06-07',
  createdAt: '2026-06-01T00:00:00.000Z',
};

const conferenceEvent = {
  id: 'conf',
  text: 'Conference',
  color: '#3b82f6',
  startDate: '2026-06-06',
  endDate: '2026-06-06',
  createdAt: '2026-06-03T00:00:00.000Z',
};

describe('eventCoversDate', () => {
  it('is true for dates inside the range, including endpoints', () => {
    expect(eventCoversDate(tripEvent, '2026-06-04')).toBe(true);
    expect(eventCoversDate(tripEvent, '2026-06-05')).toBe(true);
    expect(eventCoversDate(tripEvent, '2026-06-07')).toBe(true);
  });

  it('is false for dates outside the range', () => {
    expect(eventCoversDate(tripEvent, '2026-06-03')).toBe(false);
    expect(eventCoversDate(tripEvent, '2026-06-08')).toBe(false);
  });
});

describe('getEventForDate', () => {
  it('returns null when no event covers the date', () => {
    expect(getEventForDate([tripEvent], '2026-06-10')).toBeNull();
  });

  it('returns null for an empty or missing events list', () => {
    expect(getEventForDate([], '2026-06-04')).toBeNull();
    expect(getEventForDate(undefined, '2026-06-04')).toBeNull();
  });

  it('returns the single covering event', () => {
    expect(getEventForDate([tripEvent], '2026-06-05')).toBe(tripEvent);
  });

  it('returns the most recently created event when ranges overlap', () => {
    expect(getEventForDate([tripEvent, conferenceEvent], '2026-06-06')).toBe(conferenceEvent);
    expect(getEventForDate([conferenceEvent, tripEvent], '2026-06-06')).toBe(conferenceEvent);
  });
});
