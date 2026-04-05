import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASiggPOFcxah-W9Vp9ErJdvmS-6IYHY6o",
  authDomain: "goal-experiment.firebaseapp.com",
  projectId: "goal-experiment",
  storageBucket: "goal-experiment.firebasestorage.app",
  messagingSenderId: "1018635080021",
  appId: "1:1018635080021:web:2cd826e5047f3dda0edfdc",
  measurementId: "G-1EMT9ERNC5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
