import { describe, expect, it } from 'vitest';
import {
  MAX_SCORE_BEFORE_2048,
  boardFromCells,
  getMaxScoreBeforeTile,
  getMaxTile,
  moveBoard,
  recommendMove,
  validateBoard,
} from './twentyFortyEightSolver';

describe('moveBoard', () => {
  it('slides and merges each tile once per move', () => {
    const board = boardFromCells([
      2, 2, 2, 0,
      4, 4, 4, 4,
      0, 8, 8, 8,
      16, 0, 16, 16,
    ]);

    const result = moveBoard(board, 'left');

    expect(result.moved).toBe(true);
    expect(result.scoreGain).toBe(68);
    expect(result.board).toEqual(boardFromCells([
      4, 2, 0, 0,
      8, 8, 0, 0,
      16, 8, 0, 0,
      32, 16, 0, 0,
    ]));
  });

  it('reports an unchanged board when the direction is blocked', () => {
    const board = boardFromCells([
      2, 4, 8, 16,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ]);

    const result = moveBoard(board, 'up');

    expect(result.moved).toBe(false);
    expect(result.scoreGain).toBe(0);
    expect(result.board).toEqual(board);
  });
});

describe('validateBoard', () => {
  it('accepts blanks and powers of two only', () => {
    expect(validateBoard(boardFromCells([
      2, 4, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      0, 0, 0, 0,
    ])).valid).toBe(true);

    expect(validateBoard(boardFromCells([
      2, 3, 8, 16,
      32, 64, 128, 256,
      512, 1024, 2048, 4096,
      0, 0, 0, 0,
    ])).valid).toBe(false);
  });

  it('validates tile values above 32-bit integer range', () => {
    expect(validateBoard(boardFromCells([
      2147483648, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ])).valid).toBe(true);

    expect(validateBoard(boardFromCells([
      2147483649, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
    ])).valid).toBe(false);
  });
});

describe('recommendMove', () => {
  it('returns no move when the board is locked', () => {
    const recommendation = recommendMove(boardFromCells([
      2, 4, 2, 4,
      4, 2, 4, 2,
      2, 4, 2, 4,
      4, 2, 4, 2,
    ]));

    expect(recommendation.move).toBe(null);
    expect(recommendation.reason).toBe('game-over');
  });

  it('keeps the largest tile and snake order by moving left on a stable board', () => {
    const recommendation = recommendMove(boardFromCells([
      1024, 512, 256, 128,
      64, 32, 16, 8,
      4, 0, 2, 0,
      0, 0, 0, 0,
    ]), {
      depth: 4,
      chanceCellLimit: 6,
      timeLimitMs: 0,
    });

    expect(recommendation.move).toBe('left');
    expect(recommendation.confidence).toBeGreaterThan(0.25);
    expect(getMaxTile(recommendation.resultBoard)).toBe(1024);
  });

  it('does not recommend a move that creates 2048 in max-points mode', () => {
    const recommendation = recommendMove(boardFromCells([
      1024, 1024, 0, 0,
      2, 4, 8, 16,
      4, 8, 16, 32,
      8, 16, 32, 64,
    ]), {
      depth: 3,
      chanceCellLimit: 4,
      forbiddenTile: 2048,
      objective: 'max-score-no-2048',
    });

    expect(recommendation.move).not.toBe('left');
    expect(recommendation.move).not.toBe('right');
    expect(recommendation.candidates.every((candidate) => (
      getMaxTile(candidate.resultBoard) < 2048
    ))).toBe(true);
  });

  it('treats an existing 2048 tile as terminal in max-points mode', () => {
    const recommendation = recommendMove(boardFromCells([
      2048, 1024, 0, 0,
      2, 4, 8, 16,
      4, 8, 16, 32,
      8, 16, 32, 64,
    ]), {
      forbiddenTile: 2048,
      objective: 'max-score-no-2048',
      depth: 1,
    });

    expect(recommendation.move).toBe(null);
    expect(recommendation.reason).toBe('forbidden-tile');
  });
});

describe('getMaxScoreBeforeTile', () => {
  it('calculates the theoretical score cap before creating 2048', () => {
    expect(MAX_SCORE_BEFORE_2048).toBe(147456);
    expect(getMaxScoreBeforeTile(2048)).toBe(147456);
  });
});
