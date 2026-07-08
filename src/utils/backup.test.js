import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadGoal = vi.fn();
const loadDays = vi.fn();
const loadReflections = vi.fn();
const loadMentalChecks = vi.fn();
const saveGoal = vi.fn();
const saveDays = vi.fn();
const saveReflections = vi.fn();
const saveMentalChecks = vi.fn();

vi.mock('./storage', () => ({
  loadGoal,
  loadDays,
  loadReflections,
  loadMentalChecks,
  saveGoal,
  saveDays,
  saveReflections,
  saveMentalChecks,
}));

describe('exportData', () => {
  let clickedLink;
  let createdBlob;
  let exportData;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    clickedLink = null;
    createdBlob = null;

    globalThis.URL.createObjectURL = vi.fn((blob) => {
      createdBlob = blob;
      return 'blob:backup';
    });
    globalThis.URL.revokeObjectURL = vi.fn();
    globalThis.document = {
      createElement: vi.fn(() => {
        clickedLink = {
          click: vi.fn(),
        };
        return clickedLink;
      }),
    };

    ({ exportData } = await import('./backup'));
  });

  it('exports every active goal panel', async () => {
    loadGoal.mockResolvedValue({
      title: 'Marathon Prep',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    });
    loadDays.mockResolvedValue({
      '2026-04-15': {
        status: 'green',
        note: '8km',
        todos: [{ id: 't1', text: 'Stretch', completed: true }],
      },
    });
    loadReflections.mockResolvedValue([
      { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
    ]);
    loadMentalChecks.mockResolvedValue([
      { id: 'm1', mood: 'good', comment: 'Calm and focused', createdAt: '2026-04-15T09:00:00.000Z' },
    ]);

    await exportData();

    expect(createdBlob).toBeInstanceOf(Blob);

    const exported = JSON.parse(await createdBlob.text());
    expect(exported.goal).toEqual({
      title: 'Marathon Prep',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    });
    expect(exported.days).toEqual({
      '2026-04-15': {
        status: 'green',
        note: '8km',
        todos: [{ id: 't1', text: 'Stretch', completed: true }],
      },
    });
    expect(exported.reflections).toEqual([
      { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
    ]);
    expect(exported.mentalChecks).toEqual([
      { id: 'm1', mood: 'good', comment: 'Calm and focused', createdAt: '2026-04-15T09:00:00.000Z' },
    ]);
    expect(clickedLink.download).toMatch(/^marathon-prep-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(clickedLink.click).toHaveBeenCalledTimes(1);
  });
});

describe('importData', () => {
  let importData;
  let persistImportedData;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({ importData, persistImportedData } = await import('./backup'));
  });

  it('returns every imported panel for the app to persist', async () => {
    const file = {
      name: 'backup.json',
    };
    const payload = {
      goal: {
        title: 'Marathon Prep',
        startDate: '2026-04-01',
        endDate: '2026-04-30',
      },
      days: {
        '2026-04-15': {
          status: 'green',
          note: '8km',
          todos: [{ id: 't1', text: 'Stretch', completed: true }],
        },
      },
      reflections: [
        { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
      ],
      mentalChecks: [
        { id: 'm1', mood: 'normal', comment: 'A little tired', createdAt: '2026-04-15T09:00:00.000Z' },
      ],
    };

    globalThis.FileReader = class {
      readAsText() {
        this.onload({ target: { result: JSON.stringify(payload) } });
      }
    };

    await expect(importData(file)).resolves.toEqual({
      goal: payload.goal,
      days: payload.days,
      reflections: payload.reflections,
      mentalChecks: payload.mentalChecks,
    });
  });

  it('keeps older backups compatible by defaulting mental checks to an empty array', async () => {
    const file = { name: 'old-backup.json' };
    const payload = {
      goal: { title: 'Old goal', startDate: '2026-01-01', endDate: '2026-01-31' },
      days: {},
    };

    globalThis.FileReader = class {
      readAsText() {
        this.onload({ target: { result: JSON.stringify(payload) } });
      }
    };

    await expect(importData(file)).resolves.toMatchObject({ mentalChecks: [] });
  });

  it('persists every imported panel together', async () => {
    const imported = {
      goal: { title: 'Imported goal' },
      days: { '2026-04-15': { note: 'Imported note', todos: [] } },
      reflections: [{ id: 'r1', text: 'Imported reflection' }],
      mentalChecks: [{ id: 'm1', mood: 'good', comment: 'Imported check' }],
    };

    await persistImportedData(imported);

    expect(saveGoal).toHaveBeenCalledWith(imported.goal);
    expect(saveDays).toHaveBeenCalledWith(imported.days);
    expect(saveReflections).toHaveBeenCalledWith(imported.reflections);
    expect(saveMentalChecks).toHaveBeenCalledWith(imported.mentalChecks);
  });
});
