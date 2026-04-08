import { useCallback, useEffect, useRef, useState } from 'react';
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
import AllTodos from './components/AllTodos';
import WeeklyReview from './components/WeeklyReview';
import PasswordModal from './components/PasswordModal';
import { loadGoal, saveGoal, loadDays, saveDays, clearAll } from './utils/storage';
import { dateRange, todayString } from './utils/dates';
import { getQuote } from './utils/quotes';
import { exportData, importData } from './utils/backup';
import './App.css';

const SESSION_KEY = 'goaltracker_unlocked';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [goal, setGoal] = useState(null);
  const [days, setDays] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalDate, setModalDate] = useState(null);
  const [toast, setToast] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const importRef = useRef(null);

  const today = todayString();

  useEffect(() => {
    if (!unlocked) { setLoading(false); return; }
    setLoading(true);
    Promise.all([loadGoal(), loadDays()]).then(([g, d]) => {
      setGoal(g);
      setDays(d);
      setLoading(false);
    }).catch((err) => {
      console.error('Firestore load error:', err);
      setLoading(false);
    });
  }, [unlocked]);

  function handleUnlock() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setUnlocked(true);
  }

  async function handleGoalSave(newGoal) {
    await saveGoal(newGoal);
    await saveDays({});
    setGoal(newGoal);
    setDays({});
  }

  const handleDayClick = useCallback((dateStr) => {
    setModalDate(dateStr);
  }, []);

  async function handleDaySave(dateStr, data) {
    const next = { ...days };
    if (data === null) {
      delete next[dateStr];
    } else {
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
    await saveDays(next);
    setDays(next);
  }

  async function handleGoalEdit(updatedGoal) {
    await saveGoal(updatedGoal);
    setGoal(updatedGoal);
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
      .then(({ goal: g, days: d }) => {
        saveGoal(g);
        saveDays(d);
        setGoal(g);
        setDays(d);
      })
      .catch((msg) => setImportError(msg));
    e.target.value = '';
  }

  async function handleReset() {
    if (!confirm('Reset all data? This cannot be undone.')) return;
    await clearAll();
    setGoal(null);
    setDays({});
  }

  if (!unlocked) {
    return <PasswordModal onUnlock={handleUnlock} />;
  }

  if (loading) {
    return <div className="app-loading">Loading...</div>;
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
        <AllTodos goal={goal} days={days} />
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
