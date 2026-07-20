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
import EventsPanel from './components/EventsPanel';
import MentalCheck from './components/MentalCheck';
import { ensureDailyMentalChecks, mentalCheckStartDate } from './components/mentalChecksModel';
import CompletedGoals from './components/CompletedGoals';
import CompletionCelebration from './components/CompletionCelebration';
import TodoInsights from './components/TodoInsights';
import WeeklyCheckIn from './components/WeeklyCheckIn';
import PasswordModal from './components/PasswordModal';
import {
  loadGoal,
  saveGoal,
  loadDays,
  saveDays,
  loadReflections,
  saveReflections,
  loadMentalChecks,
  saveMentalChecks,
  loadEvents,
  saveEvents,
  loadCompletedGoals,
  archiveCompletedGoal,
  deleteCompletedGoal,
  clearActiveGoal,
} from './utils/storage';
import { dateRange } from './utils/dates';
import { getQuote } from './utils/quotes';
import { exportData, importData, persistImportedData } from './utils/backup';
import { applySeededPlanningTodo, normalizeSavedDay } from './utils/seededTodos';
import { createCompletedGoal } from './utils/completedGoals';
import { getEventForDate } from './utils/events';
import './App.css';

const SESSION_KEY = 'goaltracker_unlocked';

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === '1');
  const [goal, setGoal] = useState(null);
  const [days, setDays] = useState({});
  const [reflections, setReflections] = useState([]);
  const [mentalChecks, setMentalChecks] = useState([]);
  const [events, setEvents] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [celebrationGoal, setCelebrationGoal] = useState(null);
  const [page, setPage] = useState('tracker');
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
    Promise.all([
      loadGoal(),
      loadDays(),
      loadReflections(),
      loadMentalChecks(),
      loadEvents(),
      loadCompletedGoals(),
    ]).then(([g, d, r, m, ev, completed]) => {
      const normalizedDays = applySeededPlanningTodo(g, d);
      const normalizedMentalChecks = g ? ensureDailyMentalChecks(m, mentalCheckStartDate(g)) : m;
      setGoal(g);
      setDays(normalizedDays);
      setReflections(r);
      setMentalChecks(normalizedMentalChecks);
      setEvents(ev);
      setCompletedGoals(completed);
      if (g && normalizedDays !== d) {
        saveDays(normalizedDays);
      }
      if (normalizedMentalChecks !== m) {
        saveMentalChecks(normalizedMentalChecks);
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

  function handleBackToTracker() {
    setPage('tracker');
  }

  async function handleGoalSave(newGoal) {
    const seededDays = applySeededPlanningTodo(newGoal, {});
    const dailyMentalChecks = ensureDailyMentalChecks([], mentalCheckStartDate(newGoal));
    await Promise.all([
      saveGoal(newGoal),
      saveDays(seededDays),
      saveMentalChecks(dailyMentalChecks),
      saveEvents([]),
    ]);
    setGoal(newGoal);
    setDays(seededDays);
    setMentalChecks(dailyMentalChecks);
    setEvents([]);
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

    if (hasCompletedGoal(goal, normalizedDays)) {
      const completedGoal = createCompletedGoal({
        goal,
        days: normalizedDays,
        reflections,
        mentalChecks,
        events,
      });

      try {
        await archiveCompletedGoal(completedGoal);
        setCompletedGoals((current) => [completedGoal, ...current]);
        setCelebrationGoal(completedGoal);
        setGoal(null);
        setDays({});
        setMentalChecks([]);
        setEvents([]);
        setModalDate(null);
        setToast(null);
        setPage('tracker');
      } catch {
        setImportError('Could not archive the completed goal. Your active goal is still safe. Try again.');
      }
      return;
    }

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

  async function handleMentalChecksChange(nextChecks) {
    await saveMentalChecks(nextChecks);
    setMentalChecks(nextChecks);
  }

  async function handleEventsChange(nextEvents) {
    await saveEvents(nextEvents);
    setEvents(nextEvents);
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
      .then(async ({ goal: g, days: d, reflections: r, mentalChecks: m, events: ev }) => {
        const normalizedDays = applySeededPlanningTodo(g, d);
        const normalizedMentalChecks = ensureDailyMentalChecks(m, mentalCheckStartDate(g));
        await persistImportedData({
          goal: g,
          days: normalizedDays,
          reflections: r,
          mentalChecks: normalizedMentalChecks,
          events: ev,
        });
        setGoal(g);
        setDays(normalizedDays);
        setReflections(r);
        setMentalChecks(normalizedMentalChecks);
        setEvents(ev);
      })
      .catch((error) => setImportError(
        typeof error === 'string'
          ? error
          : 'Could not import this goal. Your existing data was not changed.',
      ));
    e.target.value = '';
  }

  async function handleReset() {
    setGoalMenuOpen(false);
    if (!confirm('Reset the active goal? This cannot be undone.')) return;
    await clearActiveGoal();
    setGoal(null);
    setDays({});
    setMentalChecks([]);
    setEvents([]);
  }

  async function handleDeleteCompletedGoal(completedGoalId) {
    await deleteCompletedGoal(completedGoalId);
    setCompletedGoals((current) => (
      current.filter((completedGoal) => completedGoal.id !== completedGoalId)
    ));
  }

  function handleShowCompletedGoals() {
    setToast(null);
    setGoalMenuOpen(false);
    setPage('completed');
  }

  if (!unlocked) {
    return <PasswordModal onUnlock={handleUnlock} />;
  }

  if (loading) {
    return <div className="app-loading">Loading…</div>;
  }

  if (celebrationGoal) {
    return (
      <CompletionCelebration
        completedGoal={celebrationGoal}
        onContinue={() => setCelebrationGoal(null)}
      />
    );
  }

  if (page === 'completed') {
    return (
      <CompletedGoals
        completedGoals={completedGoals}
        onBack={handleBackToTracker}
        onDelete={handleDeleteCompletedGoal}
      />
    );
  }

  const modalDayNumber = modalDate && goal
    ? dateRange(goal.startDate, goal.endDate).indexOf(modalDate) + 1
    : null;

  if (!goal) {
    return (
      <GoalSetup
        onSave={handleGoalSave}
        onImportFile={handleImportFile}
        onShowCompletedGoals={handleShowCompletedGoals}
        completedGoalsCount={completedGoals.length}
        importError={importError}
        onDismissImportError={() => setImportError('')}
      />
    );
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
              <button
                type="button"
                className="goal-menu-item"
                onClick={handleShowCompletedGoals}
              >
                Completed goals
              </button>
              <button type="button" className="goal-menu-item danger" onClick={handleReset}>
                Reset active goal
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
        <CalendarGrid goal={goal} days={days} events={events} onDayClick={handleDayClick} />
        <EventsPanel goal={goal} events={events} onChange={handleEventsChange} />
        <TodoInsights goal={goal} days={days} />
        <WeeklyCheckIn goal={goal} days={days} />
        <NotesTable goal={goal} days={days} />
        <SelfReflections reflections={reflections} onChange={handleReflectionsChange} />
        <MentalCheck checks={mentalChecks} onChange={handleMentalChecksChange} />
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
          event={getEventForDate(events, modalDate)}
          onSave={handleDaySave}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  );
}
