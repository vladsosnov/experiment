import { describe, expect, it } from 'vitest';
import { getWeekRange, isDateInWeek } from './weeks';

describe('getWeekRange', () => {
  it('returns the monday to sunday range for a midweek date', () => {
    expect(getWeekRange('2026-06-03')).toEqual({
      start: '2026-06-01',
      end: '2026-06-07',
    });
  });

  it('keeps monday as the start when the current date is monday', () => {
    expect(getWeekRange('2026-06-01')).toEqual({
      start: '2026-06-01',
      end: '2026-06-07',
    });
  });

  it('uses the previous monday when the current date is sunday', () => {
    expect(getWeekRange('2026-06-07')).toEqual({
      start: '2026-06-01',
      end: '2026-06-07',
    });
  });
});

describe('isDateInWeek', () => {
  it('returns true only for dates inside the monday to sunday week', () => {
    expect(isDateInWeek('2026-06-01', '2026-06-03')).toBe(true);
    expect(isDateInWeek('2026-06-07', '2026-06-03')).toBe(true);
    expect(isDateInWeek('2026-05-31', '2026-06-03')).toBe(false);
    expect(isDateInWeek('2026-06-08', '2026-06-03')).toBe(false);
  });
});
