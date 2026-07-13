function createCompletedGoalId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createCompletedGoal(
  { goal, days, reflections, mentalChecks, events },
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
    events,
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

export function exportCompletedGoal(completedGoal) {
  const contents = JSON.stringify(completedGoal, null, 2);
  const blob = new Blob([contents], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const title = completedGoal.goal?.title || 'completed-goal';
  const completedDate = completedGoal.completedAt?.slice(0, 10) || 'archive';
  const titleSlug = title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()
    || 'completed-goal';

  link.href = url;
  link.download = `${titleSlug}-${completedDate}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
