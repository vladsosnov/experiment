import { useMemo, useState } from 'react';
import { dateRange, todayString } from '../utils/dates';
import { STATUS_COLORS } from './statusColors';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKS_PER_PAGE = 2;

export default function WeeklyReview({ goal, days }) {
  const [page, setPage] = useState(1);
  const analysis = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    const today = todayString();
    const loggedDates = allDates.filter(d => d <= today && days[d]?.status);

    if (loggedDates.length === 0) {
      return null;
    }

    // Week-by-week breakdown
    const weeks = [];
    let currentWeek = [];
    let weekStart = 0;

    loggedDates.forEach((dateStr, idx) => {
      if (currentWeek.length === 0) weekStart = idx + 1;
      currentWeek.push({ dateStr, status: days[dateStr].status });

      if (currentWeek.length === 7 || idx === loggedDates.length - 1) {
        const counts = { green: 0, blue: 0, yellow: 0, red: 0 };
        currentWeek.forEach(({ status }) => counts[status]++);
        const goodDays = counts.green + counts.blue;

        weeks.push({
          weekNumber: Math.floor(weekStart / 7) + 1,
          dayRange: `${weekStart}-${weekStart + currentWeek.length - 1}`,
          counts,
          goodDays,
          total: currentWeek.length,
          percentage: Math.round((goodDays / currentWeek.length) * 100),
        });

        currentWeek = [];
      }
    });

    // Pattern analysis: which day of week has most issues?
    const dayOfWeekStats = {};
    DAYS_OF_WEEK.forEach(day => {
      dayOfWeekStats[day] = { green: 0, blue: 0, yellow: 0, red: 0, total: 0 };
    });

    loggedDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayName = DAYS_OF_WEEK[date.getDay()];
      const status = days[dateStr].status;
      dayOfWeekStats[dayName][status]++;
      dayOfWeekStats[dayName].total++;
    });

    // Find day with most yellow/red
    let worstDay = null;
    let worstScore = -1;
    Object.entries(dayOfWeekStats).forEach(([day, stats]) => {
      if (stats.total > 0) {
        const badScore = ((stats.yellow + stats.red) / stats.total) * 100;
        if (badScore > worstScore) {
          worstScore = badScore;
          worstDay = { day, score: Math.round(badScore) };
        }
      }
    });

    // Trend: compare last 2 weeks if available
    let trend = null;
    if (weeks.length >= 2) {
      const lastWeek = weeks[weeks.length - 1];
      const prevWeek = weeks[weeks.length - 2];
      const diff = lastWeek.goodDays - prevWeek.goodDays;
      trend = { diff, lastWeek: lastWeek.goodDays, prevWeek: prevWeek.goodDays };
    }

    return { weeks, worstDay, trend };
  }, [goal, days]);

  if (!analysis) {
    return null;
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(analysis.weeks.length / WEEKS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const pageWeeks = analysis.weeks.slice((safePage - 1) * WEEKS_PER_PAGE, safePage * WEEKS_PER_PAGE);

  return (
    <div className="weekly-review-section">
      <div className="review-header">
        <span className="review-title">📊 Weekly Review</span>
        {totalPages > 1 && (
          <span className="review-page-info">
            Week {pageWeeks[0]?.weekNumber}–{pageWeeks[pageWeeks.length - 1]?.weekNumber}
          </span>
        )}
      </div>

      {/* Trend insight */}
      {analysis.trend && (
        <div className="review-insight">
          {analysis.trend.diff > 0 ? (
            <span className="insight-positive">
              ↗️ Trending up! {analysis.trend.lastWeek} good days last week vs {analysis.trend.prevWeek} the week before (+{analysis.trend.diff})
            </span>
          ) : analysis.trend.diff < 0 ? (
            <span className="insight-negative">
              ↘️ Dip detected: {analysis.trend.lastWeek} good days last week vs {analysis.trend.prevWeek} before ({analysis.trend.diff})
            </span>
          ) : (
            <span className="insight-neutral">
              → Steady: {analysis.trend.lastWeek} good days, same as last week
            </span>
          )}
        </div>
      )}

      {/* Pattern insight */}
      {analysis.worstDay && analysis.worstDay.score > 30 && (
        <div className="review-insight">
          <span className="insight-pattern">
            💡 Pattern: {analysis.worstDay.day}s tend to be harder ({analysis.worstDay.score}% yellow/red days)
          </span>
        </div>
      )}

      {/* Week breakdown */}
      <div className="review-weeks">
        {pageWeeks.map((week) => (
          <div key={week.weekNumber} className="review-week-card">
            <div className="week-header">
              <span className="week-title">Week {week.weekNumber}</span>
              <span className="week-days">Days {week.dayRange}</span>
            </div>
            <div className="week-bar">
              <div
                className="week-bar-fill"
                style={{
                  width: `${week.percentage}%`,
                  background: week.percentage >= 70 ? '#22c55e' : week.percentage >= 50 ? '#3b82f6' : '#eab308'
                }}
              />
            </div>
            <div className="week-stats">
              <span className="week-stat">{week.goodDays}/{week.total} good days</span>
              <span className="week-pct">{week.percentage}%</span>
            </div>
            <div className="week-breakdown">
              {Object.entries(week.counts).map(([status, count]) => (
                count > 0 && (
                  <span key={status} className="week-badge" style={{ background: STATUS_COLORS[status].bg }}>
                    {count}
                  </span>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="review-pagination">
          <button
            className="pg-btn"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage === 1}
          >
            ←
          </button>

          <div className="pg-pages">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                className={`pg-num${n === safePage ? ' active' : ''}`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
          </div>

          <button
            className="pg-btn"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
          >
            →
          </button>

          <span className="pg-info">
            Page {safePage} of {totalPages}
          </span>
        </div>
      )}
    </div>
  );
}
