import { describe, expect, it } from 'vitest';
import { getDateSpecialDay, getDaySquareAppearance } from './dayAppearance';

describe('getDateSpecialDay', () => {
  it('marks configured Day for me dates as violet', () => {
    expect(getDateSpecialDay('2026-02-16')).toEqual({
      bg: '#c6a2f6',
      key: 'dayForMe',
      label: 'Day for me',
    });
    expect(getDateSpecialDay('2026-05-15')?.key).toBe('dayForMe');
    expect(getDateSpecialDay('2026-09-25')?.key).toBe('dayForMe');
    expect(getDateSpecialDay('2026-12-28')?.key).toBe('dayForMe');
  });

  it('marks configured holidays as vacation days', () => {
    expect(getDateSpecialDay('2026-05-01')).toEqual({
      bg: '#ED80E9',
      key: 'vacation',
      label: 'Vacation day',
    });
  });

  it('returns null for regular dates', () => {
    expect(getDateSpecialDay('2026-05-02')).toBeNull();
  });
});

describe('getDaySquareAppearance', () => {
  it('splits Day for me with a logged status', () => {
    expect(
      getDaySquareAppearance({
        data: { status: 'green' },
        dateStr: '2026-02-16',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
      }),
    ).toMatchObject({
      bg: 'transparent',
      isSplit: true,
      label: 'Day for me + Super day',
      splitLeftBg: '#c6a2f6',
      splitRightBg: '#50C878',
    });
  });

  it('splits vacation days with a logged status', () => {
    expect(
      getDaySquareAppearance({
        data: { status: 'red' },
        dateStr: '2026-05-01',
        dayNumber: 1,
        isFuture: false,
        isToday: false,
      }),
    ).toMatchObject({
      bg: 'transparent',
      isSplit: true,
      label: 'Vacation day + Not safe day',
      splitLeftBg: '#ED80E9',
      splitRightBg: '#FA5053',
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
});
