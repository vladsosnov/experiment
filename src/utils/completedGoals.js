function createCompletedGoalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createCompletedGoal(
  { goal, days, reflections, mentalChecks },
  completedAt = new Date().toISOString(),
  makeId = createCompletedGoalId,
) {
  return {
    version: 1,
    id: makeId(),
    status: 'completed',
    completedAt,
    goal,
    days,
    reflections,
    mentalChecks,
  };
}

export function previewCompletedGoal(completedGoal) {
  const contents = JSON.stringify(completedGoal, null, 2);
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.click();

  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
