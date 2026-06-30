/**
 * Returns today's date formatted as YYYY-MM-DD in the local timezone.
 * This avoids off-by-one errors that happen when using toISOString() on UTC dates.
 */
export const getLocalTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
