import { useCallback, useRef, useState } from 'react';
import GoalSetup from './components/GoalSetup';
import CalendarGrid from './components/CalendarGrid';
import ProgressBar from './components/ProgressBar';
import Summary from './components/Summary';
import DayModal from './components/DayModal';
import Congrats from './components/Congrats';
import QuoteToast from './components/QuoteToast';
import GoalEditModal from './components/GoalEditModal';
import NotesTable from './components/NotesTable';
import TodoInsights from './components/TodoInsights';
import WeeklyReview from './components/WeeklyReview';
import { loadGoal, saveGoal, loadDays, saveDays, clearAll } from './utils/storage';
import { dateRange, todayString } from './utils/dates';
import { getQuote } from './utils/quotes';
import { exportData, importData } from './utils/backup';
import './App.css';

function getInitialState() {
  const goal = loadGoal();
  const days = loadDays();
  return { goal, days };
}

export default function App() {
  const [{ goal, days }, setState] = useState(getInitialState);
  const [modalDate, setModalDate] = useState(null);
  const [toast, setToast] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const importRef = useRef(null);

  const today = todayString();

  function handleGoalSave(newGoal) {
    saveGoal(newGoal);
    setState({ goal: newGoal, days: {} });
  }

  const handleDayClick = useCallback((dateStr) => {
    setModalDate(dateStr);
  }, []);

  function handleDaySave(dateStr, data) {
    const next = { ...days };
    if (data === null) {
      delete next[dateStr];
    } else {
      // Save day if it has status OR todos
      const hasContent = data.status || (data.todos && data.todos.length > 0);
      if (hasContent) {
        next[dateStr] = data;
        if (data.status) {
          setToast({ quote: getQuote(data.status), status: data.status });
        }
      } else {
        delete next[dateStr];
      }
    }
    saveDays(next);
    setState((s) => ({ ...s, days: next }));
  }

  function handleGoalEdit(updatedGoal) {
    saveGoal(updatedGoal);
    setState((s) => ({ ...s, goal: updatedGoal }));
  }

  function handleExport() {
    exportData();
  }

  function handleImportClick() {
    setImportError('');
    importRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file)
      .then(({ goal: g, days: d }) => setState({ goal: g, days: d }))
      .catch((msg) => setImportError(msg));
    // Reset input so same file can be re-selected
    e.target.value = '';
  }

  function handleReset() {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    clearAll();
    setState({ goal: null, days: {} });
  }

  const modalDayNumber = modalDate && goal
    ? dateRange(goal.startDate, goal.endDate).indexOf(modalDate) + 1
    : null;

  if (!goal) {
    return <GoalSetup onSave={handleGoalSave} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <h1>🎯 {goal.title}</h1>
          <span className="app-dates">{goal.startDate} → {goal.endDate}</span>
        </div>
        <div className="header-actions">
          <button
            className="btn-today"
            onClick={() => setModalDate(today)}
            disabled={today < goal.startDate || today > goal.endDate}
          >
            Log today
          </button>
          <div className="header-tools">
            <button className="btn-ghost small" onClick={() => setEditOpen(true)}>Edit goal</button>
            <button className="btn-ghost small" onClick={handleExport}>Export</button>
            <button className="btn-ghost small" onClick={handleImportClick}>Import</button>
            <button className="btn-ghost small danger" onClick={handleReset}>Reset</button>
          </div>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </header>

      {importError && (
        <div className="import-error">
          {importError}
          <button className="import-error-close" onClick={() => setImportError('')}>✕</button>
        </div>
      )}

      <main className="app-main">
        {days[goal.endDate] && <Congrats goal={goal} days={days} />}
        <ProgressBar goal={goal} days={days} />
        <TodoInsights goal={goal} days={days} />
        <WeeklyReview goal={goal} days={days} />
        <NotesTable goal={goal} days={days} />
        <Summary goal={goal} days={days} />
        <CalendarGrid goal={goal} days={days} onDayClick={handleDayClick} />
      </main>

      {toast && (
        <QuoteToast
          key={toast.quote.text}
          quote={toast.quote}
          status={toast.status}
          onDone={() => setToast(null)}
        />
      )}

      {editOpen && (
        <GoalEditModal
          goal={goal}
          days={days}
          onSave={handleGoalEdit}
          onClose={() => setEditOpen(false)}
        />
      )}

      {modalDate && (
        <DayModal
          dateStr={modalDate}
          dayNumber={modalDayNumber}
          data={days[modalDate] ?? null}
          onSave={handleDaySave}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  );
}
