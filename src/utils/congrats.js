export function hasCompletedGoal(goal, days) {
  return Boolean(goal && days[goal.endDate]?.status);
}

export function getCongratsStats(days, totalDays) {
  const counts = { green: 0, blue: 0, yellow: 0, red: 0 };

  Object.values(days).forEach(({ status }) => {
    if (status && counts[status] !== undefined) counts[status]++;
  });

  const loggedDays = Object.values(days).filter(({ status }) => Boolean(status)).length;
  const superDays = counts.green;
  const strongPct = totalDays > 0 ? Math.round(((counts.green + counts.blue) / totalDays) * 100) : 0;

  return {
    loggedDays,
    superDays,
    strongPct,
  };
}
