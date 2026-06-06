import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadGoal = vi.fn();
const loadDays = vi.fn();
const loadReflections = vi.fn();
const saveGoal = vi.fn();
const saveDays = vi.fn();
const saveReflections = vi.fn();

vi.mock('./storage', () => ({
  loadGoal,
  loadDays,
  loadReflections,
  saveGoal,
  saveDays,
  saveReflections,
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

  it('exports resolved goal and days data', async () => {
    loadGoal.mockResolvedValue({
      title: 'Marathon Prep',
      startDate: '2026-04-01',
      endDate: '2026-04-30',
    });
    loadDays.mockResolvedValue({
      '2026-04-15': { status: 'green', note: '8km' },
    });
    loadReflections.mockResolvedValue([
      { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
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
      '2026-04-15': { status: 'green', note: '8km' },
    });
    expect(exported.reflections).toEqual([
      { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
    ]);
    expect(clickedLink.download).toMatch(/^marathon-prep-backup-\d{4}-\d{2}-\d{2}\.json$/);
    expect(clickedLink.click).toHaveBeenCalledTimes(1);
  });
});

describe('importData', () => {
  let importData;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({ importData } = await import('./backup'));
  });

  it('imports reflections when they are present in the backup', async () => {
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
        '2026-04-15': { status: 'green', note: '8km' },
      },
      reflections: [
        { id: 'r1', date: '2026-04-15', text: 'Felt behind all day' },
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
    });
    expect(saveReflections).toHaveBeenCalledWith(payload.reflections);
  });
});
