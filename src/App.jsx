import { useCallback, useEffect, useRef, useState } from 'react';
import GoalSetup from './components/GoalSetup';
import CalendarGrid from './components/CalendarGrid';
import ProgressBar from './components/ProgressBar';
import DayModal from './components/DayModal';
import Congrats from './components/Congrats';
import { hasCompletedGoal } from './utils/congrats';
import QuoteToast from './components/QuoteToast';
import GoalEditModal from './components/GoalEditModal';
import NotesTable from './components/NotesTable';
import SelfReflections from './components/SelfReflections';
import TodoInsights from './components/TodoInsights';
import AllTodos from './components/AllTodos';
import PasswordModal from './components/PasswordModal';
import {
  loadGoal,
  saveGoal,
  loadDays,
  saveDays,
  loadReflections,
  saveReflections,
  clearAll,
} from './utils/storage';
import { dateRange } from './utils/dates';
import { getQuote } from './utils/quotes';
import { exportData, importData } from './utils/backup';
import { applySeededPlanningTodo, normalizeSavedDay } from './utils/seededTodos';
import './App.css';

const SESSION_KEY = 'goaltracker_unlocked';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [goal, setGoal] = useState(null);
  const [days, setDays] = useState({});
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [modalDate, setModalDate] = useState(null);
  const [toast, setToast] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [goalMenuOpen, setGoalMenuOpen] = useState(false);
  const [importError, setImportError] = useState('');
  const importRef = useRef(null);
  const goalMenuRef = useRef(null);

  useEffect(() => {
    if (!unlocked) return;
    Promise.all([loadGoal(), loadDays(), loadReflections()]).then(([g, d, r]) => {
      const normalizedDays = applySeededPlanningTodo(g, d);
      setGoal(g);
      setDays(normalizedDays);
      setReflections(r);
      if (g && normalizedDays !== d) {
        saveDays(normalizedDays);
      }
      setLoading(false);
    }).catch((err) => {
      console.error('Firestore load error:', err);
      setLoading(false);
    });
  }, [unlocked]);

  useEffect(() => {
    if (!goalMenuOpen) return undefined;

    function handlePointerDown(e) {
      if (!goalMenuRef.current?.contains(e.target)) {
        setGoalMenuOpen(false);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') setGoalMenuOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goalMenuOpen]);

  function handleUnlock() {
    sessionStorage.setItem(SESSION_KEY, '1');
    setLoading(true);
    setUnlocked(true);
  }

  async function handleGoalSave(newGoal) {
    const seededDays = applySeededPlanningTodo(newGoal, {});
    await Promise.all([
      saveGoal(newGoal),
      saveDays(seededDays),
      saveReflections([]),
    ]);
    setGoal(newGoal);
    setDays(seededDays);
    setReflections([]);
  }

  const handleDayClick = useCallback((dateStr) => {
    setModalDate(dateStr);
  }, []);

  async function handleDaySave(dateStr, data) {
    const next = { ...days };
    const normalizedDay = normalizeSavedDay(dateStr, data);
    if (normalizedDay === null) {
      delete next[dateStr];
    } else {
      next[dateStr] = normalizedDay;
      if (data?.status) {
        setToast({ quote: getQuote(data.status), status: data.status });
      }
    }
    const normalizedDays = applySeededPlanningTodo(goal, next);
    await saveDays(normalizedDays);
    setDays(normalizedDays);
  }

  async function handleGoalEdit(updatedGoal) {
    const normalizedDays = applySeededPlanningTodo(updatedGoal, days);
    await saveGoal(updatedGoal);
    await saveDays(normalizedDays);
    setGoal(updatedGoal);
    setDays(normalizedDays);
  }

  async function handleReflectionsChange(nextReflections) {
    await saveReflections(nextReflections);
    setReflections(nextReflections);
  }

  async function handleExport() {
    setGoalMenuOpen(false);
    await exportData();
  }

  function handleImportClick() {
    setImportError('');
    setGoalMenuOpen(false);
    importRef.current?.click();
  }

  function handleImportFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    importData(file)
      .then(async ({ goal: g, days: d, reflections: r }) => {
        const normalizedDays = applySeededPlanningTodo(g, d);
        await Promise.all([
          saveGoal(g),
          saveDays(normalizedDays),
          saveReflections(r),
        ]);
        setGoal(g);
        setDays(normalizedDays);
        setReflections(r);
      })
      .catch((msg) => setImportError(msg));
    e.target.value = '';
  }

  async function handleReset() {
    setGoalMenuOpen(false);
    if (!confirm('Reset all data? This cannot be undone.')) return;
    await clearAll();
    setGoal(null);
    setDays({});
    setReflections([]);
  }

  if (!unlocked) {
    return <PasswordModal onUnlock={handleUnlock} />;
  }

  if (loading) {
    return <div className="app-loading">Loading…</div>;
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
        <div className="header-actions" ref={goalMenuRef}>
          <button
            type="button"
            className="btn-goal-menu"
            onClick={() => setGoalMenuOpen((open) => !open)}
            aria-label="Open goal actions"
            aria-expanded={goalMenuOpen}
          >
            ☰
          </button>
          {goalMenuOpen && (
            <div className="goal-menu">
              <span className="goal-menu-title">Goal actions</span>
              <button
                type="button"
                className="goal-menu-item"
                onClick={() => {
                  setEditOpen(true);
                  setGoalMenuOpen(false);
                }}
              >
                Edit
              </button>
              <button type="button" className="goal-menu-item" onClick={handleExport}>
                Export
              </button>
              <button type="button" className="goal-menu-item" onClick={handleImportClick}>
                Import
              </button>
              <button type="button" className="goal-menu-item danger" onClick={handleReset}>
                Reset
              </button>
            </div>
          )}
          <input
            ref={importRef}
            type="file"
            accept=".json"
            aria-label="Import goal backup"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
      </header>

      {importError && (
        <div className="import-error">
          {importError}
          <button
            type="button"
            className="import-error-close"
            onClick={() => setImportError('')}
            aria-label="Dismiss import error"
          >
            ✕
          </button>
        </div>
      )}

      <main className="app-main">
        {hasCompletedGoal(goal, days) && <Congrats goal={goal} days={days} />}
        <ProgressBar goal={goal} days={days} />
        <CalendarGrid goal={goal} days={days} onDayClick={handleDayClick} />
        <TodoInsights goal={goal} days={days} />
        <AllTodos goal={goal} days={days} />
        <NotesTable goal={goal} days={days} />
        <SelfReflections reflections={reflections} onChange={handleReflectionsChange} />
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
