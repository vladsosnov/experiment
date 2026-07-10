import {
  boardFromCells,
  getEmptyCells,
  getMaxTile,
  moveBoard,
  recommendMove,
} from './twentyFortyEightSolver.js';

export function createSeededRandom(seed) {
  let state = seed >>> 0;

  return function random() {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function spawnRandomTile(board, random) {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return board;

  const cell = emptyCells[Math.floor(random() * emptyCells.length)];
  const next = board.map((row) => row.slice());
  next[cell.row][cell.column] = random() < 0.9 ? 2 : 4;

  return next;
}

export function createStartingBoard(random) {
  let board = boardFromCells(Array(16).fill(0));
  board = spawnRandomTile(board, random);
  board = spawnRandomTile(board, random);
  return board;
}

export function playGame({
  seed = 1,
  depth = 4,
  chanceCellLimit = 6,
  maxMoves = 2000,
  timeLimitMs = 0,
} = {}) {
  const random = createSeededRandom(seed);
  let board = createStartingBoard(random);
  let score = 0;
  let moves = 0;
  let lastRecommendation = null;

  while (moves < maxMoves) {
    const recommendation = recommendMove(board, {
      depth,
      chanceCellLimit,
      timeLimitMs,
    });

    if (!recommendation.move) {
      lastRecommendation = recommendation;
      break;
    }

    const moved = moveBoard(board, recommendation.move);
    if (!moved.moved) {
      lastRecommendation = recommendation;
      break;
    }

    score += moved.scoreGain;
    board = spawnRandomTile(moved.board, random);
    moves += 1;
    lastRecommendation = recommendation;
  }

  return {
    board,
    maxTile: getMaxTile(board),
    moves,
    score,
    lastRecommendation,
  };
}
