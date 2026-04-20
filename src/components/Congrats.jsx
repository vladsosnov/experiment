import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getCongratsStats } from '../utils/congrats';

const MESSAGES = [
  { headline: 'You did it.', body: "Every single day was a choice. You kept choosing to show up. That's rare — and it's everything." },
  { headline: 'Mission complete.', body: "Most people quit on day 3. You made it to the last day. Let that sink in." },
  { headline: 'The streak is yours.', body: "The person who started this journey and the person finishing it are not the same. Growth happened." },
  { headline: 'You stayed the course.', body: "Life got hard. You logged it anyway. That honesty and consistency will carry you further than any single good day." },
  { headline: 'This is what discipline looks like.', body: "Not perfect — consistent. And consistent beats perfect every time." },
];

function pickMessage(days) {
  // Pick deterministically based on green day % so it feels personal
  const count = Object.keys(days).length;
  const idx = count % MESSAGES.length;
  return MESSAGES[idx];
}

function fireConfetti() {
  const burst = (origin, angle) =>
    confetti({
      particleCount: 80,
      spread: 60,
      angle,
      origin,
      colors: ['#50C878', '#6395EE', '#FFCE1B', '#a855f7', '#f8fafc'],
    });
  burst({ x: 0.2, y: 0.6 }, 60);
  setTimeout(() => burst({ x: 0.8, y: 0.6 }, 120), 200);
  setTimeout(() =>
    confetti({ particleCount: 60, spread: 100, origin: { x: 0.5, y: 0.5 }, scalar: 1.2 }),
    500
  );
}

export default function Congrats({ goal, days }) {
  const { headline, body } = pickMessage(days);
  const { loggedDays, superDays, strongPct } = getCongratsStats(days, goal.totalDays);

  useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <div className="congrats-banner">
      <div className="congrats-glow" />
      <div className="congrats-inner">
        <span className="congrats-emoji">🏆</span>
        <div className="congrats-text">
          <h2 className="congrats-headline">{headline}</h2>
          <p className="congrats-body">{body}</p>
        </div>
        <div className="congrats-stats">
          <div className="cstat">
            <span className="cstat-val">{loggedDays}</span>
            <span className="cstat-label">days logged</span>
          </div>
          <div className="cstat-divider" />
          <div className="cstat">
            <span className="cstat-val">{superDays}</span>
            <span className="cstat-label">super days</span>
          </div>
          <div className="cstat-divider" />
          <div className="cstat">
            <span className="cstat-val">{strongPct}%</span>
            <span className="cstat-label">strong days</span>
          </div>
        </div>
      </div>
    </div>
  );
}
