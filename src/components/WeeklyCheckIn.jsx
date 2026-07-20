import { useMemo, useState } from 'react';
import { fromDateString, todayString } from '../utils/dates';
import { getWeekRange, isDateInWeek, toDateString } from '../utils/weeks';
import { buildWeeklyCheckInPrompt, getCheckInWeekDates } from '../utils/weeklyCheckIn';

function shiftWeek(anchorDate, direction) {
  const { start } = getWeekRange(anchorDate);
  const shifted = fromDateString(start);
  shifted.setDate(shifted.getDate() + direction * 7);
  return toDateString(shifted);
}

export default function WeeklyCheckIn({ goal, days }) {
  const [anchorDate, setAnchorDate] = useState(() => todayString());
  const [copied, setCopied] = useState(false);

  const { start, end } = getWeekRange(anchorDate);
  const weekDates = useMemo(() => getCheckInWeekDates(goal, anchorDate), [goal, anchorDate]);
  const loggedCount = weekDates.filter((dateStr) => days[dateStr]).length;
  const canGoPrev = start > goal.startDate;
  const canGoNext = end < goal.endDate;
  const isCurrentWeek = isDateInWeek(todayString(), anchorDate);

  const prompt = useMemo(
    () => buildWeeklyCheckInPrompt(goal, days, anchorDate),
    [goal, days, anchorDate],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="checkin-section">
      <div className="notes-header checkin-header">
        <div>
          <span className="notes-title">Weekly Check-In</span>
          <span className="reflections-subtitle">Turn your daily notes into a reflection prompt for ChatGPT</span>
        </div>
        <div className="reflections-header-actions">
          <button
            type="button"
            className="btn-ghost small"
            onClick={() => setAnchorDate(shiftWeek(anchorDate, -1))}
            disabled={!canGoPrev}
            aria-label="Previous week"
          >
            ←
          </button>
          <span className="checkin-week-range">
            {start} → {end}{isCurrentWeek ? ' (this week)' : ''}
          </span>
          <button
            type="button"
            className="btn-ghost small"
            onClick={() => setAnchorDate(shiftWeek(anchorDate, 1))}
            disabled={!canGoNext}
            aria-label="Next week"
          >
            →
          </button>
        </div>
      </div>

      <div className="checkin-body">
        <p className="checkin-summary">{loggedCount} of {weekDates.length} days logged this week.</p>
        <textarea
          className="checkin-prompt-preview"
          value={prompt}
          readOnly
          rows={10}
          aria-label="Weekly check-in prompt"
        />
        <div className="modal-actions">
          <button type="button" className="btn-primary" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy prompt'}
          </button>
        </div>
      </div>
    </div>
  );
}
