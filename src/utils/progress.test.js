import { describe, expect, it } from 'vitest';
import { formatProgressPct } from './progress';

describe('formatProgressPct', () => {
  it('shows one decimal place for fractional percentages', () => {
    expect(formatProgressPct(9, 92)).toBe('9.8');
    expect(formatProgressPct(10, 98)).toBe('10.2');
  });

  it('shows one decimal place for whole percentages', () => {
    expect(formatProgressPct(10, 100)).toBe('10.0');
  });

  it('returns 0.0 when total is zero', () => {
    expect(formatProgressPct(0, 0)).toBe('0.0');
  });
});
