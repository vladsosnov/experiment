import { beforeEach, describe, expect, it, vi } from 'vitest';

const doc = vi.fn((db, collection, id) => ({ db, collection, id }));
const collection = vi.fn((db, name) => ({ db, name }));
const getDoc = vi.fn();
const getDocs = vi.fn();
const setDoc = vi.fn();
const deleteDoc = vi.fn();
const writeBatch = vi.fn();

vi.mock('../firebase', () => ({
  db: 'mock-db',
}));

vi.mock('firebase/firestore', () => ({
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
}));

describe('reflection and mental check storage', () => {
  let loadReflections;
  let saveReflections;
  let clearActiveGoal;
  let loadMentalChecks;
  let saveMentalChecks;
  let archiveCompletedGoal;
  let loadCompletedGoals;
  let deleteCompletedGoal;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    ({
      loadReflections,
      saveReflections,
      loadMentalChecks,
      saveMentalChecks,
      archiveCompletedGoal,
      loadCompletedGoals,
      deleteCompletedGoal,
      clearActiveGoal,
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
    await clearActiveGoal();

    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'goal' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'days' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'reflections' });
    expect(deleteDoc).toHaveBeenCalledWith({ db: 'mock-db', collection: 'data', id: 'mentalChecks' });
  });

  it('atomically archives a completed goal and clears the active goal', async () => {
    const completed = { id: 'completed-2', goal: { title: 'Second goal' } };
    const batch = {
      set: vi.fn(),
      commit: vi.fn(),
    };
    writeBatch.mockReturnValue(batch);

    await archiveCompletedGoal(completed);

    expect(writeBatch).toHaveBeenCalledWith('mock-db');
    expect(batch.set).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'completedGoals', id: 'completed-2' },
      completed,
    );
    expect(batch.set).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'goal' },
      { value: null },
    );
    expect(batch.set).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'days' },
      { value: {} },
    );
    expect(batch.set).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'reflections' },
      { value: [] },
    );
    expect(batch.set).toHaveBeenCalledWith(
      { db: 'mock-db', collection: 'data', id: 'mentalChecks' },
      { value: [] },
    );
    expect(batch.commit).toHaveBeenCalledTimes(1);
  });

  it('loads separate completed goal JSON documents newest first', async () => {
    const older = { id: 'older', completedAt: '2026-06-01T12:00:00.000Z' };
    const newer = { id: 'newer', completedAt: '2026-07-10T18:00:00.000Z' };
    getDocs.mockResolvedValue({
      docs: [
        { data: () => older },
        { data: () => newer },
      ],
    });

    await expect(loadCompletedGoals()).resolves.toEqual([newer, older]);
    expect(getDocs).toHaveBeenCalledWith({ db: 'mock-db', name: 'completedGoals' });
  });

  it('deletes one completed goal JSON document', async () => {
    await deleteCompletedGoal('completed-2');

    expect(deleteDoc).toHaveBeenCalledWith({
      db: 'mock-db',
      collection: 'completedGoals',
      id: 'completed-2',
    });
  });
});
