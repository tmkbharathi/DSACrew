/**
 * Timezone-safe Local Date Utilities
 * Ensures dates are consistently evaluated in the user's local timezone (e.g. IST, PST, EST, GMT)
 * instead of defaulting to UTC (which causes off-by-one day bugs).
 */

/**
 * Returns YYYY-MM-DD for a given Date object (or now) in local timezone.
 */
export const getLocalTodayStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats any Date or timestamp to local YYYY-MM-DD.
 */
export const formatLocalDate = (input?: Date | string | number): string => {
  if (!input) return getLocalTodayStr();
  if (typeof input === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return getLocalTodayStr();
  return getLocalTodayStr(d);
};

/**
 * Parses YYYY-MM-DD into a local Date object set at 12:00 PM (noon)
 * to avoid daylight savings / timezone midnight roll-overs.
 */
export const parseLocalDate = (dateStr?: string): Date => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }
  return new Date(dateStr);
};

/**
 * Adds or subtracts days from a YYYY-MM-DD string and returns the new YYYY-MM-DD.
 */
export const addDaysToDateStr = (dateStr: string, days: number): string => {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return getLocalTodayStr(d);
};
