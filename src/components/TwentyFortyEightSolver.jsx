import React, { useMemo, useState } from 'react';
import {
  DIRECTION_LABELS,
  DIRECTIONS,
  boardFromCells,
  flattenBoard,
  getMaxTile,
  moveBoard,
  recommendMove,
  validateBoard,
} from '../utils/twentyFortyEightSolver';
import './TwentyFortyEightSolver.css';

const MODES = [
  { id: 'fast', label: 'Fast', depth: 2, chanceCellLimit: 4 },
  { id: 'strong', label: 'Strong', depth: 4, chanceCellLimit: 4 },
  { id: 'deep', label: 'Deep', depth: 5, chanceCellLimit: 4 },
];

const SAMPLE_BOARD = [
  1024, 512, 256, 128,
  64, 32, 16, 8,
  4, 0, 2, 0,
  0, 0, 0, 0,
];

function cellsToInputs(cells) {
  return cells.map((value) => {
    const number = Number(value);
    return number > 0 ? String(number) : '';
  });
}

function getTileRank(value) {
  if (!value || value < 2) return 0;
  return Math.min(12, Math.log2(value));
}

function parsePastedBoard(text) {
  const numbers = text.match(/\d+/g);
  if (!numbers || numbers.length < 16) return null;
  return cellsToInputs(numbers.slice(0, 16));
}

function formatRating(value) {
  return Math.round(value).toLocaleString('en-US');
}

function formatConfidence(value) {
  return `${Math.round(value * 100)}%`;
}

export default function TwentyFortyEightSolver({ onBack }) {
  const [cells, setCells] = useState(() => cellsToInputs(Array(16).fill(0)));
  const [modeId, setModeId] = useState('strong');
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[1];

  const board = useMemo(() => boardFromCells(cells), [cells]);
  const validation = useMemo(() => validateBoard(board), [board]);
  const recommendation = useMemo(() => (
    validation.valid
      ? recommendMove(board, {
        depth: mode.depth,
        chanceCellLimit: mode.chanceCellLimit,
        timeLimitMs: mode.id === 'deep' ? 1200 : 0,
      })
      : {
        move: null,
        reason: 'invalid-board',
        errors: validation.errors,
        candidates: [],
        confidence: 0,
      }
  ), [board, mode, validation]);

  const flatBoard = flattenBoard(board);
  const maxTile = getMaxTile(board);
  const bestCandidate = recommendation.candidates[0] ?? null;
  const previewCells = bestCandidate ? flattenBoard(bestCandidate.resultBoard) : flatBoard;

  function updateCell(index, value) {
    const digitsOnly = value.replace(/\D/g, '');
    setCells((current) => {
      const next = current.slice();
      next[index] = digitsOnly === '0' ? '' : digitsOnly;
      return next;
    });
  }

  function loadSampleBoard() {
    setCells(cellsToInputs(SAMPLE_BOARD));
  }

  function clearBoard() {
    setCells(cellsToInputs(Array(16).fill(0)));
  }

  function applyMove(direction) {
    if (!validation.valid) return;
    const result = moveBoard(board, direction);
    if (!result.moved) return;
    setCells(cellsToInputs(flattenBoard(result.board)));
  }

  function handlePaste(event) {
    const nextCells = parsePastedBoard(event.clipboardData.getData('text'));
    if (!nextCells) return;
    event.preventDefault();
    setCells(nextCells);
  }

  function handleKeyDown(event, index) {
    const row = Math.floor(index / 4);
    const column = index % 4;
    const nextByKey = {
      ArrowUp: row > 0 ? index - 4 : index,
      ArrowDown: row < 3 ? index + 4 : index,
      ArrowLeft: column > 0 ? index - 1 : index,
      ArrowRight: column < 3 ? index + 1 : index,
    };
    const nextIndex = nextByKey[event.key];
    if (nextIndex === undefined || nextIndex === index) return;

    event.preventDefault();
    const input = document.querySelector(`[data-board-index="${nextIndex}"]`);
    input?.focus();
    input?.select();
  }

  return (
    <div className="solver-page">
      <header className="solver-header">
        <div>
          <p className="solver-kicker">2048</p>
          <h1>Move Solver</h1>
        </div>
        <div className="solver-header-actions">
          {onBack && (
            <button type="button" className="solver-secondary-button" onClick={onBack}>
              Tracker
            </button>
          )}
          <button type="button" className="solver-secondary-button" onClick={loadSampleBoard}>
            Sample
          </button>
          <button type="button" className="solver-secondary-button" onClick={clearBoard}>
            Clear
          </button>
        </div>
      </header>

      <main className="solver-layout">
        <section className="solver-board-panel" aria-labelledby="solver-board-title">
          <div className="solver-section-heading">
            <h2 id="solver-board-title">Board</h2>
            <span>{maxTile ? `Max ${maxTile}` : 'Empty'}</span>
          </div>
          <div className="solver-board" onPaste={handlePaste}>
            {cells.map((cell, index) => {
              const value = flatBoard[index];
              return (
                <input
                  key={index}
                  data-board-index={index}
                  className={`solver-cell tile-rank-${getTileRank(value)}`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  aria-label={`Row ${Math.floor(index / 4) + 1} column ${(index % 4) + 1}`}
                  value={cell}
                  onChange={(event) => updateCell(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(event, index)}
                />
              );
            })}
          </div>
          {!validation.valid && (
            <p className="solver-error">
              {validation.errors[0]?.message ?? 'Invalid board.'}
            </p>
          )}
        </section>

        <section className="solver-advice-panel" aria-labelledby="solver-advice-title">
          <div className="solver-section-heading">
            <h2 id="solver-advice-title">Suggestion</h2>
            <span>{mode.label}</span>
          </div>

          <div className="solver-mode-group" aria-label="Search strength">
            {MODES.map((item) => (
              <button
                key={item.id}
                type="button"
                className={item.id === modeId ? 'active' : ''}
                aria-pressed={item.id === modeId}
                onClick={() => setModeId(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="solver-recommendation" data-testid="recommended-move">
            <span className="solver-recommendation-label">
              {recommendation.move ? recommendation.label : 'No legal move'}
            </span>
            <span className="solver-confidence">
              Confidence {formatConfidence(recommendation.confidence)}
            </span>
          </div>

          <div className="solver-direction-actions">
            {DIRECTIONS.map((direction) => (
              <button
                key={direction}
                type="button"
                className={recommendation.move === direction ? 'recommended' : ''}
                disabled={!validation.valid || !moveBoard(board, direction).moved}
                onClick={() => applyMove(direction)}
              >
                {DIRECTION_LABELS[direction]}
              </button>
            ))}
          </div>

          <div className="solver-preview-grid" aria-label="Recommended result board">
            {previewCells.map((value, index) => (
              <span
                key={`${index}-${value}`}
                className={`solver-preview-cell tile-rank-${getTileRank(value)}`}
              >
                {value || ''}
              </span>
            ))}
          </div>
        </section>
      </main>

      <section className="solver-candidates" aria-labelledby="solver-candidates-title">
        <div className="solver-section-heading">
          <h2 id="solver-candidates-title">Move Scores</h2>
          <span>
            Depth {recommendation.depth ?? 0}
            {' '}
            |
            {' '}
            {recommendation.nodes ?? 0}
            {' '}
            nodes
          </span>
        </div>
        <div className="solver-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Move</th>
                <th>Rating</th>
                <th>Gain</th>
                <th>Open</th>
                <th>Max</th>
              </tr>
            </thead>
            <tbody>
              {recommendation.candidates.length > 0 ? recommendation.candidates.map((candidate) => (
                <tr key={candidate.direction}>
                  <td>{candidate.label}</td>
                  <td>{formatRating(candidate.expectedScore)}</td>
                  <td>{candidate.scoreGain}</td>
                  <td>{candidate.emptyCells}</td>
                  <td>{candidate.maxTile}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">No candidate moves</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
