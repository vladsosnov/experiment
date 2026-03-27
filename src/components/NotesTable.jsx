import { useMemo, useState } from 'react';
import { dateRange } from '../utils/dates';
import { STATUS_COLORS } from './statusColors';

const PAGE_SIZE = 7;

export default function NotesTable({ goal, days }) {
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const allDates = dateRange(goal.startDate, goal.endDate);
    return allDates
      .map((dateStr, idx) => ({ dateStr, dayNumber: idx + 1, data: days[dateStr] ?? null }))
      .filter((r) => r.data !== null);
  }, [goal, days]);

  // Reset to page 1 if rows shrink and current page is out of range
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="notes-section">
      <div className="notes-header">
        <span className="notes-title">Day log</span>
        <span className="notes-count">{rows.length} entr{rows.length === 1 ? 'y' : 'ies'}</span>
      </div>

      <div className="notes-table-wrap">
        <table className="notes-table">
          <thead>
            <tr>
              <th className="col-day">#</th>
              <th className="col-date">Date</th>
              <th className="col-status">Status</th>
              <th className="col-note">Note</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="nt-empty">No logs yet</td>
              </tr>
            ) : pageRows.map(({ dateStr, dayNumber, data }) => {
              const color = data.status ? STATUS_COLORS[data.status] : null;
              return (
                <tr key={dateStr}>
                  <td className="col-day">{dayNumber}</td>
                  <td className="col-date">{dateStr}</td>
                  <td className="col-status">
                    {color ? (
                      <>
                        <span className="nt-status-dot" style={{ background: color.bg }} />
                        <span className="nt-status-label">{color.label}</span>
                      </>
                    ) : (
                      <span className="nt-no-note">—</span>
                    )}
                  </td>
                  <td className="col-note">
                    {data.note ? (
                      <span className="nt-note">{data.note}</span>
                    ) : (
                      <span className="nt-no-note">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="notes-pagination">
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
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)} of {rows.length}
          </span>
        </div>
      )}
    </div>
  );
}
