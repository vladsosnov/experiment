import { db } from '../firebase';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const GOAL_DOC = 'data/goal';
const DAYS_DOC = 'data/days';

export async function loadGoal() {
  try {
    const snap = await getDoc(doc(db, 'data', 'goal'));
    return snap.exists() ? snap.data().value : null;
  } catch {
    return null;
  }
}

export async function saveGoal(goal) {
  await setDoc(doc(db, 'data', 'goal'), { value: goal });
}

export async function loadDays() {
  try {
    const snap = await getDoc(doc(db, 'data', 'days'));
    return snap.exists() ? snap.data().value : {};
  } catch {
    return {};
  }
}

export async function saveDays(days) {
  const clean = JSON.parse(JSON.stringify(days));
  await setDoc(doc(db, 'data', 'days'), { value: clean });
}

export async function clearAll() {
  await Promise.all([
    deleteDoc(doc(db, 'data', 'goal')),
    deleteDoc(doc(db, 'data', 'days')),
  ]);
}
