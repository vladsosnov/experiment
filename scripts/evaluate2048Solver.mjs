import { playGame } from '../src/utils/twentyFortyEightSimulation.js';

function readNumberArg(name, fallback) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) return Number(inline.slice(prefix.length));

  const index = process.argv.indexOf(name);
  if (index !== -1 && process.argv[index + 1]) {
    return Number(process.argv[index + 1]);
  }

  return fallback;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[middle];
  return (sorted[middle - 1] + sorted[middle]) / 2;
}

function average(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function histogram(values) {
  return values.reduce((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

const seconds = readNumberArg('--seconds', 300);
const targetGames = readNumberArg('--games', 0);
const minGames = readNumberArg('--min-games', targetGames || 8);
const depth = readNumberArg('--depth', 4);
const chanceCellLimit = readNumberArg('--chance-cell-limit', 6);
const seed = readNumberArg('--seed', 2048);
const minAverageMaxTile = readNumberArg('--min-average-max-tile', 512);
const minBestTile = readNumberArg('--min-best-tile', 1024);
const startedAt = Date.now();
const endAt = startedAt + seconds * 1000;
const results = [];

function shouldContinue() {
  if (targetGames > 0) return results.length < targetGames;
  return Date.now() < endAt || results.length < minGames;
}

while (shouldContinue()) {
  const game = playGame({
    seed: seed + results.length,
    depth,
    chanceCellLimit,
  });
  results.push(game);
}

const elapsedSeconds = (Date.now() - startedAt) / 1000;
const scores = results.map((game) => game.score);
const maxTiles = results.map((game) => game.maxTile);
const moves = results.map((game) => game.moves);
const bestTile = Math.max(...maxTiles);
const averageMaxTile = average(maxTiles);
const averageScore = average(scores);
const checks = [
  {
    label: `games >= ${minGames}`,
    passed: results.length >= minGames,
  },
  {
    label: `average max tile >= ${minAverageMaxTile}`,
    passed: averageMaxTile >= minAverageMaxTile,
  },
  {
    label: `best tile >= ${minBestTile}`,
    passed: bestTile >= minBestTile,
  },
];

console.log('2048 solver confidence evaluation');
console.log(`Elapsed: ${elapsedSeconds.toFixed(1)}s`);
console.log(`Games: ${results.length}`);
console.log(`Depth: ${depth}`);
console.log(`Chance cell limit: ${chanceCellLimit}`);
console.log(`Average score: ${Math.round(averageScore)}`);
console.log(`Median score: ${Math.round(median(scores))}`);
console.log(`Average max tile: ${Math.round(averageMaxTile)}`);
console.log(`Median max tile: ${median(maxTiles)}`);
console.log(`Best tile: ${bestTile}`);
console.log(`Average moves: ${Math.round(average(moves))}`);
console.log(`Max tile histogram: ${JSON.stringify(histogram(maxTiles))}`);

for (const check of checks) {
  console.log(`${check.passed ? 'PASS' : 'FAIL'} ${check.label}`);
}

if (checks.some((check) => !check.passed)) {
  process.exitCode = 1;
}
