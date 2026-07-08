import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { getCongratsStats } from '../utils/congrats';

const FIREWORK_COLORS = ['#50c878', '#6395ee', '#ffce1b', '#a855f7', '#f8fafc'];

function firework(origin) {
  confetti({
    particleCount: 110,
    spread: 85,
    startVelocity: 48,
    gravity: 0.85,
    scalar: 1.05,
    colors: FIREWORK_COLORS,
    origin,
  });
}

export default function CompletionCelebration({ completedGoal, onContinue }) {
  const [showContinue, setShowContinue] = useState(() => (
    typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  ));
  const goal = completedGoal.goal;
  const days = completedGoal.days;
  const { loggedDays, superDays, strongPct } = getCongratsStats(days, goal.totalDays);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      return undefined;
    }

    const timers = [
      setTimeout(() => firework({ x: 0.18, y: 0.55 }), 0),
      setTimeout(() => firework({ x: 0.82, y: 0.5 }), 280),
      setTimeout(() => firework({ x: 0.5, y: 0.38 }), 600),
      setTimeout(() => firework({ x: 0.28, y: 0.42 }), 920),
      setTimeout(() => firework({ x: 0.72, y: 0.44 }), 1_200),
      setTimeout(() => setShowContinue(true), 1_650),
    ];

    return () => {
      timers.forEach(clearTimeout);
      confetti.reset();
    };
  }, []);

  return (
    <main className="completion-celebration" aria-live="polite">
      <section className="completion-card">
        <span className="completion-trophy" aria-hidden="true">🏆</span>
        <p className="completion-kicker">Mission accomplished</p>
        <h1>Goal complete!</h1>
        <p className="completion-title">{goal.title}</p>
        <p className="completion-message">
          You reached the final day and preserved the whole journey. Take a moment to enjoy it.
        </p>

        <div className="completion-stats" aria-label="Completed goal statistics">
          <div><strong>{loggedDays}</strong><span>days logged</span></div>
          <div><strong>{superDays}</strong><span>super days</span></div>
          <div><strong>{strongPct}%</strong><span>strong days</span></div>
        </div>

        <button
          type="button"
          className={`btn-primary completion-continue${showContinue ? ' visible' : ''}`}
          disabled={!showContinue}
          onClick={onContinue}
        >
          Get ready for a new goal
        </button>
      </section>
    </main>
  );
}
