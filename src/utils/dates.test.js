import { describe, expect, it } from 'vitest';
import { HOLIDAY_DATES, OBSERVED_HOLIDAY_DATES, isHoliday } from './dates';

describe('HOLIDAY_DATES', () => {
  it('contains the configured upcoming Ukrainian holidays', () => {
    expect(HOLIDAY_DATES).toEqual([
      '2026-05-01',
      '2026-05-08',
      '2026-06-28',
    ]);
  });
});

describe('isHoliday', () => {
  it('returns true for configured holidays that are not moved', () => {
    expect(isHoliday('2026-05-01')).toBe(true);
    expect(isHoliday('2026-05-08')).toBe(true);
  });

  it('moves sunday holidays to monday for highlighting', () => {
    expect(OBSERVED_HOLIDAY_DATES).toEqual([
      '2026-05-01',
      '2026-05-08',
      '2026-06-29',
    ]);
    expect(isHoliday('2026-06-28')).toBe(false);
    expect(isHoliday('2026-06-29')).toBe(true);
  });

  it('returns false for regular dates', () => {
    expect(isHoliday('2026-05-02')).toBe(false);
    expect(isHoliday('2026-06-27')).toBe(false);
  });
});
