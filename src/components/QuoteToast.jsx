import { useEffect, useState } from 'react';
import { STATUS_COLORS } from './DaySquare';

const STATUS_EMOJI = { green: '🌟', blue: '💪', yellow: '🔥', red: '❤️' };

export default function QuoteToast({ quote, status, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 20);
    const t2 = setTimeout(() => setVisible(false), 10000);
    const t3 = setTimeout(() => onDone(), 10700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  const accent = STATUS_COLORS[status]?.bg ?? '#6366f1';

  return (
    <div className={`quote-toast${visible ? ' qt-visible' : ''}`} style={{ '--qt-accent': accent }}>
      <span className="qt-emoji">{STATUS_EMOJI[status] ?? '✨'}</span>
      <div className="qt-body">
        <p className="qt-text">"{quote.text}"</p>
        <p className="qt-author">— {quote.author}</p>
      </div>
    </div>
  );
}
