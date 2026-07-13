export function eventCoversDate(event, dateStr) {
  return dateStr >= event.startDate && dateStr <= event.endDate;
}

/**
 * Return the event covering dateStr, or null. When multiple events overlap
 * a date, the most recently created one wins.
 */
export function getEventForDate(events, dateStr) {
  const covering = (events ?? []).filter((event) => eventCoversDate(event, dateStr));
  if (covering.length === 0) return null;
  return covering.reduce((latest, event) => (
    event.createdAt > latest.createdAt ? event : latest
  ));
}
