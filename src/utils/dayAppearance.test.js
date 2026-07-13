import { describe, expect, it } from 'vitest';
import { getDateSpecialDay, getDaySquareAppearance, listSpecialDaysInRange } from './dayAppearance';

describe('getDateSpecialDay', () => {
  it('marks configured personal vacation dates as violet', () => {
    expect(getDateSpecialDay('2026-06-04')).toEqual({
      bg: '#c4b5fd',
      key: 'personalVacation',
      label: 'Vacation',
    });
  });

  it('marks configured holidays as vacation days with flag backgrounds', () => {
    expect(getDateSpecialDay('2026-05-01')).toEqual({
      bg: 'linear-gradient(to bottom, #005BBB 50%, #FFD500 50%)',
      key: 'vacation',
      label: 'Vacation day',
    });
    expect(getDateSpecialDay('2026-05-25')).toEqual({
      bg: 'linear-gradient(to bottom, #fff 50%, #DC143C 50%)',
      key: 'vacation',
      label: 'Vacation day',
      textColor: '#000',
    });
    expect(getDateSpecialDay('2026-06-29')).toEqual({
      bg: 'linear-gradient(to bottom, #005BBB 50%, #FFD500 50%)',
      key: 'vacation',
      label: 'Vacation day',
    });
  });

  it('returns null for regular dates', () => {
    expect(getDateSpecialDay('2026-05-02')).toBeNull();
  });
});

describe('getDaySquareAppearance', () => {
  it('uses only the logged status color for submitted personal vacation days', () => {
    expect(
      getDaySquareAppearance({
        data: { status: 'green' },
        dateStr: '2026-06-05',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
      }),
    ).toMatchObject({
      bg: '#50C878',
      isSplit: false,
      label: 'Super day',
      splitLeftBg: null,
      splitRightBg: null,
    });
  });

  it('uses only the logged status color for submitted vacation days', () => {
    expect(
      getDaySquareAppearance({
        data: { status: 'red' },
        dateStr: '2026-05-01',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
      }),
    ).toMatchObject({
      bg: '#FA5053',
      isSplit: false,
      label: 'Not safe day',
      splitLeftBg: null,
      splitRightBg: null,
    });
  });

  it('keeps worked weekend precedence over date-based special days', () => {
    expect(
      getDaySquareAppearance({
        data: { status: 'blue', workedWeekend: true },
        dateStr: '2026-05-01',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
      }),
    ).toMatchObject({
      isSplit: true,
      label: 'Worked weekend + Good day',
      splitLeftBg: '#a855f7',
      splitRightBg: '#6395EE',
    });
  });

  it('renders a custom event as the cell highlight and its text as the label', () => {
    const event = { color: '#22c55e', text: 'Road trip' };
    expect(
      getDaySquareAppearance({
        data: null,
        dateStr: '2026-06-04',
        dayNumber: 5,
        isFuture: false,
        isToday: false,
        event,
      }),
    ).toMatchObject({
      bg: '#22c55e',
      isSplit: false,
      label: 'Road trip',
      eventText: 'Road trip',
    });
  });

  it('splits the cell between the event color and a logged status', () => {
    const event = { color: '#22c55e', text: 'Road trip' };
    expect(
      getDaySquareAppearance({
        data: { status: 'green' },
        dateStr: '2026-06-04',
        dayNumber: 5,
        isFuture: false,
        isToday: false,
        event,
      }),
    ).toMatchObject({
      isSplit: true,
      label: 'Road trip + Super day',
      splitLeftBg: '#22c55e',
      splitRightBg: '#50C878',
      eventText: 'Road trip',
    });
  });

  it('lets a custom event outrank a built-in special day on the same date', () => {
    const event = { color: '#3b82f6', text: 'Road trip' };
    expect(
      getDaySquareAppearance({
        data: null,
        dateStr: '2026-06-04',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
        event,
      }),
    ).toMatchObject({
      bg: '#3b82f6',
      isSplit: false,
      label: 'Road trip',
    });
  });
});

describe('listSpecialDaysInRange', () => {
  it('lists built-in special days within the range with their label and color', () => {
    expect(listSpecialDaysInRange('2026-06-03', '2026-06-06')).toEqual([
      { date: '2026-06-04', label: 'Vacation', bg: '#c4b5fd' },
      { date: '2026-06-05', label: 'Vacation', bg: '#c4b5fd' },
    ]);
  });

  it('returns an empty array when no special days fall in the range', () => {
    expect(listSpecialDaysInRange('2026-03-01', '2026-03-05')).toEqual([]);
  });
});
