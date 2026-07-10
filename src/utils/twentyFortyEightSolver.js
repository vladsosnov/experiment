export const BOARD_SIZE = 4;
export const DIRECTIONS = ['up', 'left', 'right', 'down'];

export const DIRECTION_LABELS = {
  up: 'Up',
  left: 'Left',
  right: 'Right',
  down: 'Down',
};

const TILE_PROBABILITIES = [
  { value: 2, probability: 0.9 },
  { value: 4, probability: 0.1 },
];

export const MAX_SCORE_BEFORE_2048 = getMaxScoreBeforeTile(2048);

const SNAKE_PATTERNS = [
  [
    [15, 14, 13, 12],
    [8, 9, 10, 11],
    [7, 6, 5, 4],
    [0, 1, 2, 3],
  ],
  [
    [12, 13, 14, 15],
    [11, 10, 9, 8],
    [4, 5, 6, 7],
    [3, 2, 1, 0],
  ],
  [
    [3, 2, 1, 0],
    [4, 5, 6, 7],
    [11, 10, 9, 8],
    [12, 13, 14, 15],
  ],
  [
    [0, 1, 2, 3],
    [7, 6, 5, 4],
    [8, 9, 10, 11],
    [15, 14, 13, 12],
  ],
  [
    [15, 8, 7, 0],
    [14, 9, 6, 1],
    [13, 10, 5, 2],
    [12, 11, 4, 3],
  ],
  [
    [12, 11, 4, 3],
    [13, 10, 5, 2],
    [14, 9, 6, 1],
    [15, 8, 7, 0],
  ],
  [
    [3, 4, 11, 12],
    [2, 5, 10, 13],
    [1, 6, 9, 14],
    [0, 7, 8, 15],
  ],
  [
    [0, 7, 8, 15],
    [1, 6, 9, 14],
    [2, 5, 10, 13],
    [3, 4, 11, 12],
  ],
];

function now() {
  return typeof performance === 'undefined' ? Date.now() : performance.now();
}

function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0));
}

function toCellNumber(value) {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : NaN;
}

export function boardFromCells(cells) {
  const flat = Array.isArray(cells?.[0]) ? cells.flat() : cells;
  if (!Array.isArray(flat) || flat.length !== BOARD_SIZE * BOARD_SIZE) {
    throw new Error('A 2048 board needs exactly 16 cells.');
  }

  return Array.from({ length: BOARD_SIZE }, (_, row) => (
    flat
      .slice(row * BOARD_SIZE, row * BOARD_SIZE + BOARD_SIZE)
      .map(toCellNumber)
  ));
}

export function flattenBoard(board) {
  return board.flat();
}

export function cloneBoard(board) {
  return board.map((row) => row.slice());
}

export function isPowerOfTwo(value) {
  return Number.isInteger(value) && value > 0 && Number.isInteger(Math.log2(value));
}

export function validateBoard(board) {
  const errors = [];

  if (!Array.isArray(board) || board.length !== BOARD_SIZE) {
    return {
      valid: false,
      errors: [{ message: 'The board must have 4 rows.' }],
    };
  }

  board.forEach((row, rowIndex) => {
    if (!Array.isArray(row) || row.length !== BOARD_SIZE) {
      errors.push({ row: rowIndex, message: 'Each row must have 4 cells.' });
      return;
    }

    row.forEach((value, columnIndex) => {
      if (value === 0) return;
      if (!Number.isFinite(value) || !Number.isInteger(value) || value < 0) {
        errors.push({
          row: rowIndex,
          column: columnIndex,
          value,
          message: 'Use positive whole numbers only.',
        });
        return;
      }

      if (!isPowerOfTwo(value)) {
        errors.push({
          row: rowIndex,
          column: columnIndex,
          value,
          message: '2048 tiles must be powers of two.',
        });
      }
    });
  });

  return { valid: errors.length === 0, errors };
}

function boardsEqual(a, b) {
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (a[row][column] !== b[row][column]) return false;
    }
  }
  return true;
}

function getLine(board, direction, index) {
  if (direction === 'left') return board[index].slice();
  if (direction === 'right') return board[index].slice().reverse();
  if (direction === 'up') {
    return Array.from({ length: BOARD_SIZE }, (_, row) => board[row][index]);
  }
  if (direction === 'down') {
    return Array.from({ length: BOARD_SIZE }, (_, row) => board[BOARD_SIZE - row - 1][index]);
  }
  throw new Error(`Unknown direction: ${direction}`);
}

function setLine(board, direction, index, line) {
  const writableLine = direction === 'right' || direction === 'down'
    ? line.slice().reverse()
    : line;

  if (direction === 'left' || direction === 'right') {
    board[index] = writableLine;
    return;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    board[row][index] = writableLine[row];
  }
}

function mergeLine(line) {
  const tiles = line.filter((value) => value !== 0);
  const merged = [];
  let scoreGain = 0;

  for (let index = 0; index < tiles.length; index += 1) {
    if (tiles[index] === tiles[index + 1]) {
      const value = tiles[index] * 2;
      merged.push(value);
      scoreGain += value;
      index += 1;
    } else {
      merged.push(tiles[index]);
    }
  }

  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }

  return { line: merged, scoreGain };
}

export function moveBoard(board, direction) {
  if (!DIRECTIONS.includes(direction)) {
    throw new Error(`Unknown direction: ${direction}`);
  }

  const nextBoard = createEmptyBoard();
  let scoreGain = 0;

  for (let index = 0; index < BOARD_SIZE; index += 1) {
    const { line, scoreGain: lineScoreGain } = mergeLine(getLine(board, direction, index));
    setLine(nextBoard, direction, index, line);
    scoreGain += lineScoreGain;
  }

  return {
    board: nextBoard,
    moved: !boardsEqual(board, nextBoard),
    scoreGain,
  };
}

export function getEmptyCells(board) {
  const cells = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (board[row][column] === 0) cells.push({ row, column });
    }
  }

  return cells;
}

export function getMaxTile(board) {
  return Math.max(0, ...flattenBoard(board));
}

function logTile(value) {
  return value > 0 ? Math.log2(value) : 0;
}

export function getMaxScoreBeforeTile(forbiddenTile, boardSize = BOARD_SIZE) {
  const maxTile = forbiddenTile / 2;
  const maxTileRank = logTile(maxTile);
  const scorePerMaxTile = (maxTileRank - 1) * maxTile;

  return boardSize * boardSize * scorePerMaxTile;
}

function countMergeOpportunities(board) {
  let opportunities = 0;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const value = board[row][column];
      if (value === 0) continue;
      if (column < BOARD_SIZE - 1 && board[row][column + 1] === value) opportunities += 1;
      if (row < BOARD_SIZE - 1 && board[row + 1][column] === value) opportunities += 1;
    }
  }

  return opportunities;
}

function countAdjacentValuePairs(board, targetValue) {
  let pairs = 0;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      if (board[row][column] !== targetValue) continue;
      if (column < BOARD_SIZE - 1 && board[row][column + 1] === targetValue) pairs += 1;
      if (row < BOARD_SIZE - 1 && board[row + 1][column] === targetValue) pairs += 1;
    }
  }

  return pairs;
}

function smoothnessScore(board) {
  let penalty = 0;

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const value = board[row][column];
      if (value === 0) continue;

      const current = logTile(value);
      if (column < BOARD_SIZE - 1 && board[row][column + 1] !== 0) {
        penalty -= Math.abs(current - logTile(board[row][column + 1]));
      }
      if (row < BOARD_SIZE - 1 && board[row + 1][column] !== 0) {
        penalty -= Math.abs(current - logTile(board[row + 1][column]));
      }
    }
  }

  return penalty;
}

function monotonicityScore(board) {
  const totals = [0, 0, 0, 0];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE - 1; column += 1) {
      const current = logTile(board[row][column]);
      const next = logTile(board[row][column + 1]);
      if (current > next) totals[0] += next - current;
      if (next > current) totals[1] += current - next;
    }
  }

  for (let column = 0; column < BOARD_SIZE; column += 1) {
    for (let row = 0; row < BOARD_SIZE - 1; row += 1) {
      const current = logTile(board[row][column]);
      const next = logTile(board[row + 1][column]);
      if (current > next) totals[2] += next - current;
      if (next > current) totals[3] += current - next;
    }
  }

  return Math.max(totals[0], totals[1]) + Math.max(totals[2], totals[3]);
}

function snakeScore(board) {
  let best = -Infinity;

  for (const pattern of SNAKE_PATTERNS) {
    let total = 0;
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        total += board[row][column] * (pattern[row][column] + 1);
      }
    }
    best = Math.max(best, total);
  }

  return best;
}

function maxTileInCorner(board) {
  const maxTile = getMaxTile(board);
  if (maxTile === 0) return false;

  return [
    board[0][0],
    board[0][BOARD_SIZE - 1],
    board[BOARD_SIZE - 1][0],
    board[BOARD_SIZE - 1][BOARD_SIZE - 1],
  ].includes(maxTile);
}

export function scoreBoard(board, options = {}) {
  const emptyCount = getEmptyCells(board).length;
  const maxTile = getMaxTile(board);
  if (options.forbiddenTile && maxTile >= options.forbiddenTile) {
    return -1000000000;
  }

  const maxRank = logTile(maxTile);
  const mergeOpportunities = countMergeOpportunities(board);
  const dangerousPairs = options.forbiddenTile
    ? countAdjacentValuePairs(board, options.forbiddenTile / 2)
    : 0;
  const scoreObjectiveBonus = options.objective === 'max-score-no-2048'
    ? mergeOpportunities * 2400 + maxRank * maxRank * 180
    : 0;

  return (
    emptyCount * 3200
    + emptyCount * emptyCount * 180
    + mergeOpportunities * 1100
    + monotonicityScore(board) * 470
    + smoothnessScore(board) * 130
    + snakeScore(board) * 1.35
    + maxRank * maxRank * 85
    + (maxTileInCorner(board) ? 5200 : 0)
    + scoreObjectiveBonus
    - dangerousPairs * 22000
  );
}

function getSearchDepth(board, requestedDepth) {
  if (requestedDepth) return requestedDepth;

  const emptyCount = getEmptyCells(board).length;
  if (emptyCount >= 9) return 4;
  if (emptyCount >= 5) return 5;
  return 6;
}

function getBoardKey(board) {
  return flattenBoard(board).join(',');
}

function hasTimedOut(context) {
  return context.deadlineMs > 0 && now() - context.startedAt >= context.deadlineMs;
}

function withTile(board, row, column, value) {
  const next = cloneBoard(board);
  next[row][column] = value;
  return next;
}

function hasForbiddenTile(board, forbiddenTile) {
  return Boolean(forbiddenTile) && getMaxTile(board) >= forbiddenTile;
}

function getPlayableMoves(board, context = {}) {
  return DIRECTIONS
    .map((direction) => ({ direction, result: moveBoard(board, direction) }))
    .filter(({ result }) => (
      result.moved && !hasForbiddenTile(result.board, context.forbiddenTile)
    ));
}

function rankChanceCells(board, emptyCells, limit, context) {
  if (emptyCells.length <= limit) return emptyCells;

  return emptyCells
    .map((cell) => ({
      ...cell,
      risk: scoreBoard(withTile(board, cell.row, cell.column, 2), context.evaluation),
    }))
    .sort((a, b) => a.risk - b.risk)
    .slice(0, limit)
    .map(({ row, column }) => ({ row, column }));
}

function expectimaxPlayer(board, depth, context) {
  context.nodes += 1;
  if (depth <= 0 || hasTimedOut(context)) return scoreBoard(board, context.evaluation);

  const key = `p:${depth}:${getBoardKey(board)}`;
  if (context.cache.has(key)) return context.cache.get(key);

  const moves = getPlayableMoves(board, context);
  if (moves.length === 0) {
    const terminalScore = scoreBoard(board, context.evaluation) - 100000;
    context.cache.set(key, terminalScore);
    return terminalScore;
  }

  let best = -Infinity;
  for (const { result } of moves) {
    const value = result.scoreGain * context.scoreGainWeight
      + expectimaxChance(result.board, depth, context);
    if (value > best) best = value;
  }

  context.cache.set(key, best);
  return best;
}

function expectimaxChance(board, depth, context) {
  context.nodes += 1;
  if (depth <= 0 || hasTimedOut(context)) return scoreBoard(board, context.evaluation);

  const key = `c:${depth}:${getBoardKey(board)}`;
  if (context.cache.has(key)) return context.cache.get(key);

  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) {
    const value = expectimaxPlayer(board, depth - 1, context);
    context.cache.set(key, value);
    return value;
  }

  const cells = rankChanceCells(board, emptyCells, context.chanceCellLimit, context);
  const cellProbability = 1 / cells.length;
  let expectedValue = 0;

  for (const cell of cells) {
    for (const tile of TILE_PROBABILITIES) {
      expectedValue += cellProbability
        * tile.probability
        * expectimaxPlayer(withTile(board, cell.row, cell.column, tile.value), depth - 1, context);
    }
  }

  context.cache.set(key, expectedValue);
  return expectedValue;
}

function confidenceFromCandidates(candidates) {
  if (candidates.length === 0) return 0;
  if (candidates.length === 1) return 1;

  const best = candidates[0].expectedScore;
  const worst = candidates[candidates.length - 1].expectedScore;
  const temperature = Math.max(850, Math.abs(best - worst) / 3);
  const weights = candidates.map((candidate) => (
    Math.exp((candidate.expectedScore - best) / temperature)
  ));
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  return Math.min(0.99, Math.max(0.25, weights[0] / total));
}

function describeCandidate(result) {
  return {
    board: result.board,
    emptyCells: getEmptyCells(result.board).length,
    maxTile: getMaxTile(result.board),
    mergeOpportunities: countMergeOpportunities(result.board),
    scoreGain: result.scoreGain,
  };
}

export function recommendMove(board, options = {}) {
  const normalizedBoard = boardFromCells(board);
  const validation = validateBoard(normalizedBoard);

  if (!validation.valid) {
    return {
      move: null,
      reason: 'invalid-board',
      errors: validation.errors,
      candidates: [],
      confidence: 0,
      depth: 0,
      nodes: 0,
      elapsedMs: 0,
    };
  }

  if (options.forbiddenTile && getMaxTile(normalizedBoard) >= options.forbiddenTile) {
    return {
      move: null,
      reason: 'forbidden-tile',
      candidates: [],
      confidence: 0,
      depth: 0,
      nodes: 0,
      elapsedMs: 0,
    };
  }

  const rawPlayableMoves = getPlayableMoves(normalizedBoard);
  const playableMoves = getPlayableMoves(normalizedBoard, {
    forbiddenTile: options.forbiddenTile,
  });
  if (playableMoves.length === 0) {
    return {
      move: null,
      reason: rawPlayableMoves.length === 0 ? 'game-over' : 'no-safe-move',
      candidates: [],
      confidence: 0,
      depth: 0,
      nodes: 0,
      elapsedMs: 0,
    };
  }

  const depth = getSearchDepth(normalizedBoard, options.depth);
  const context = {
    cache: new Map(),
    chanceCellLimit: options.chanceCellLimit ?? 7,
    deadlineMs: options.timeLimitMs ?? 0,
    evaluation: {
      forbiddenTile: options.forbiddenTile,
      objective: options.objective,
    },
    forbiddenTile: options.forbiddenTile,
    nodes: 0,
    scoreGainWeight: options.scoreGainWeight
      ?? (options.objective === 'max-score-no-2048' ? 6.5 : 2.4),
    startedAt: now(),
  };

  const candidates = playableMoves
    .map(({ direction, result }) => ({
      direction,
      label: DIRECTION_LABELS[direction],
      expectedScore: result.scoreGain * context.scoreGainWeight
        + expectimaxChance(result.board, depth, context),
      resultBoard: result.board,
      ...describeCandidate(result),
    }))
    .sort((a, b) => b.expectedScore - a.expectedScore);

  const winner = candidates[0];

  return {
    move: winner.direction,
    label: winner.label,
    confidence: confidenceFromCandidates(candidates),
    candidates,
    resultBoard: winner.resultBoard,
    reason: 'recommended',
    depth,
    nodes: context.nodes,
    elapsedMs: Math.round(now() - context.startedAt),
  };
}
