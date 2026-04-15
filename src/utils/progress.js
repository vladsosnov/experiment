export function formatProgressPct(filled, total) {
  if (total <= 0) return '0.0';
  return ((filled / total) * 100).toFixed(1);
}
