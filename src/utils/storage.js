import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const DATA_COLLECTION = 'data';
const GOAL_DOC = 'goal';
const DAYS_DOC = 'days';
const REFLECTIONS_DOC = 'reflections';
const MENTAL_CHECKS_DOC = 'mentalChecks';

export async function loadGoal() {
  try {
    const snap = await getDoc(doc(db, DATA_COLLECTION, GOAL_DOC));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}

export async function saveGoal(goal) {
  await setDoc(doc(db, DATA_COLLECTION, GOAL_DOC), { value: goal });
}

export async function loadDays() {
  try {
    const snap = await getDoc(doc(db, DATA_COLLECTION, DAYS_DOC));
    return snap.exists() ? snap.data().value : {};
  } catch {
    return {};
  }
}

export async function saveDays(days) {
  const clean = JSON.parse(JSON.stringify(days));
  await setDoc(doc(db, DATA_COLLECTION, DAYS_DOC), { value: clean });
}

export async function loadReflections() {
  try {
    const snap = await getDoc(doc(db, DATA_COLLECTION, REFLECTIONS_DOC));
    if (!snap.exists()) return [];
    const value = snap.data().value;
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function saveReflections(reflections) {
  const clean = JSON.parse(JSON.stringify(Array.isArray(reflections) ? reflections : []));
  await setDoc(doc(db, DATA_COLLECTION, REFLECTIONS_DOC), { value: clean });
}

export async function loadMentalChecks() {
  try {
    const snap = await getDoc(doc(db, DATA_COLLECTION, MENTAL_CHECKS_DOC));
    if (!snap.exists()) return [];
    const value = snap.data().value;
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export async function saveMentalChecks(checks) {
  const clean = JSON.parse(JSON.stringify(Array.isArray(checks) ? checks : []));
  await setDoc(doc(db, DATA_COLLECTION, MENTAL_CHECKS_DOC), { value: clean });
}

export async function clearAll() {
  await Promise.all([
    deleteDoc(doc(db, DATA_COLLECTION, GOAL_DOC)),
    deleteDoc(doc(db, DATA_COLLECTION, DAYS_DOC)),
    deleteDoc(doc(db, DATA_COLLECTION, REFLECTIONS_DOC)),
    deleteDoc(doc(db, DATA_COLLECTION, MENTAL_CHECKS_DOC)),
  ]);
}
