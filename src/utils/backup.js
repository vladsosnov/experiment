import {
  loadGoal,
  loadDays,
  loadReflections,
  loadMentalChecks,
  saveGoal,
  saveDays,
  saveReflections,
  saveMentalChecks,
} from './storage';

export async function exportData() {
  const [goal, days, reflections, mentalChecks] = await Promise.all([
    loadGoal(),
    loadDays(),
    loadReflections(),
    loadMentalChecks(),
  ]);
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    goal,
    days,
    reflections,
    mentalChecks,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const goalTitle = goal?.title ?? 'goal-tracker';
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `${goalTitle.replace(/\s+/g, '-').toLowerCase()}-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an imported File object.
 * Returns a Promise that resolves to { goal, days, reflections, mentalChecks } or rejects with an error message.
 */
export function importData(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.name.endsWith('.json')) {
      reject('Please select a .json backup file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.goal || !parsed.days) {
          reject('Invalid backup file: missing goal or days data.');
          return;
        }
        if (!parsed.goal.startDate || !parsed.goal.endDate) {
          reject('Invalid backup file: goal is missing date fields.');
          return;
        }
        const reflections = Array.isArray(parsed.reflections) ? parsed.reflections : [];
        const mentalChecks = Array.isArray(parsed.mentalChecks) ? parsed.mentalChecks : [];
        saveGoal(parsed.goal);
        saveDays(parsed.days);
        saveReflections(reflections);
        saveMentalChecks(mentalChecks);
        resolve({ goal: parsed.goal, days: parsed.days, reflections, mentalChecks });
      } catch {
        reject('Could not parse the file. Make sure it is a valid backup.');
      }
    };
    reader.onerror = () => reject('Failed to read the file.');
    reader.readAsText(file);
  });
}
