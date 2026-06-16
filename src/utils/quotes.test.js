import { describe, expect, it, vi } from 'vitest';
import { getQuote } from './quotes';

const OLD_GREEN_QUOTES = new Set([
  'Small daily improvements over time lead to stunning results.',
  'Success is the sum of small efforts, repeated day in and day out.',
  "You don't rise to the level of your goals, you fall to the level of your systems.",
  'The secret of getting ahead is getting started.',
]);

const OLD_BLUE_QUOTES = new Set([
  'Progress, not perfection.',
  'Every day you show up is a win.',
  'You are closer than you were yesterday.',
  'A little progress each day adds up to big results.',
]);

function collectSampledQuoteTexts(status) {
  const randomSpy = vi.spyOn(Math, 'random');

  try {
    return Array.from({ length: 120 }, (_, index) => {
      randomSpy.mockReturnValueOnce(index / 120);
      return getQuote(status).text;
    });
  } finally {
    randomSpy.mockRestore();
  }
}

describe('getQuote', () => {
  it('uses a replaced, expanded quote pool for super days', () => {
    const quotes = collectSampledQuoteTexts('green');
    const uniqueQuotes = new Set(quotes);

    expect(uniqueQuotes.size).toBeGreaterThanOrEqual(45);
    expect(quotes.some((quote) => OLD_GREEN_QUOTES.has(quote))).toBe(false);
  });

  it('uses a replaced, expanded quote pool for good days', () => {
    const quotes = collectSampledQuoteTexts('blue');
    const uniqueQuotes = new Set(quotes);

    expect(uniqueQuotes.size).toBeGreaterThanOrEqual(45);
    expect(quotes.some((quote) => OLD_BLUE_QUOTES.has(quote))).toBe(false);
  });
});
