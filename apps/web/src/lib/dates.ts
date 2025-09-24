import { format, startOfWeek, addWeeks, subWeeks, parseISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

export const TIMEZONE = 'Asia/Kolkata';

// Get current date in the specified timezone
export function getCurrentDate(): Date {
  return utcToZonedTime(new Date(), TIMEZONE);
}

// Get start of week (Monday) for a given date
export function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 }); // Monday = 1
}

// Get current week start
export function getCurrentWeekStart(): Date {
  return getWeekStart(getCurrentDate());
}

// Format date for API (YYYY-MM-DD)
export function formatDateForApi(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

// Format date for display
export function formatDateDisplay(date: Date): string {
  return format(date, 'MMM dd, yyyy');
}

// Format day of week
export function formatDayOfWeek(date: Date): string {
  return format(date, 'EEE');
}

// Get week navigation dates
export function getWeekNavigation(currentWeekStart: Date) {
  return {
    previous: subWeeks(currentWeekStart, 1),
    next: addWeeks(currentWeekStart, 1),
    current: currentWeekStart,
  };
}

// Generate array of dates for a week (Monday to Sunday)
export function getWeekDates(weekStart: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    dates.push(date);
  }
  return dates;
}

// Check if a date is in the future (compared to current date in timezone)
export function isFutureDate(date: Date): boolean {
  const today = getCurrentDate();
  const dateInTimezone = utcToZonedTime(date, TIMEZONE);
  
  // Reset time to compare just dates
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dateStart = new Date(dateInTimezone.getFullYear(), dateInTimezone.getMonth(), dateInTimezone.getDate());
  
  return dateStart > todayStart;
}

// Parse date from API response
export function parseDateFromApi(dateString: string): Date {
  return parseISO(dateString);
}

// Convert date string to display in local timezone
export function displayDate(dateString: string): Date {
  const utcDate = parseISO(dateString);
  return utcToZonedTime(utcDate, TIMEZONE);
}