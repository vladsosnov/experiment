import { beforeEach, describe, expect, it, vi } from 'vitest';

const doc = vi.fn((db, collection, id) => ({ db, collection, id }));
const getDoc = vi.fn();
const setDoc = vi.fn();
const deleteDoc = vi.fn();

vi.mock('../firebase', () => ({
  db: 'mock-db',
}));

vi.mock('firebase/firestore', () => ({
  doc,
  getDoc,
  setDoc,
  deleteDoc,
}));

describe('reflection and mental check storage', () => {
  let loadReflections;
  let saveReflections;
  let clearAll;
  let loadMentalChecks;
  let saveMentalChecks;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({
      loadReflections,
      saveReflections,
      loadMentalChecks,
      saveMentalChecks,
      clearAll,
    } = await import('./storage'));
  });

  it('loads saved reflections as an array', async () => {
    const reflections = [
      { id: 'r1', date: '2026-06-06', text: 'Too much context switching' },
    ];
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ value: reflections }),
    });

    await expect(loadReflections()).resolves.toEqual(reflections);
    expect(getDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'reflections' });
  });

  it('falls back to an empty array when reflections are missing or malformed', async () => {
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ value: { bad: 'shape' } }),
    });

    await expect(loadReflections()).resolves.toEqual([]);
  });

  it('saves a JSON-clean copy of reflections', async () => {
    await saveReflections([
      { id: 'r1', date: '2026-06-06', text: 'Too much context switching', ignored: undefined },
    ]);

    expect(setDoc).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'reflections' },
      {
        value: [
          { id: 'r1', date: '2026-06-06', text: 'Too much context switching' },
        ],
      },
    );
  });

  it('loads and saves JSON-clean mental checks', async () => {
    const checks = [
      { id: 'm1', mood: 'great', comment: 'Clear headed', createdAt: '2026-06-06T08:00:00.000Z' },
    ];
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ value: checks }) });

    await expect(loadMentalChecks()).resolves.toEqual(checks);
    expect(getDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'mentalChecks' });

    await saveMentalChecks([{ ...checks[0], ignored: undefined }]);
    expect(setDoc).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'mentalChecks' },
      { value: checks },
    );
  });

  it('clears reflections with the rest of the app data', async () => {
    await clearAll();

    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'goal' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'days' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'reflections' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'mentalChecks' });
  });
});
