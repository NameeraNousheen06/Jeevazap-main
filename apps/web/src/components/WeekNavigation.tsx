import { formatDateDisplay, getWeekNavigation, formatDayOfWeek } from '../lib/dates';

interface WeekNavigationProps {
  currentWeekStart: Date;
  onWeekChange: (weekStart: Date) => void;
}

export default function WeekNavigation({ currentWeekStart, onWeekChange }: WeekNavigationProps) {
  const { previous, next } = getWeekNavigation(currentWeekStart);
  
  const handleDateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(event.target.value);
    if (!isNaN(selectedDate.getTime())) {
      // Get Monday of the selected week
      const weekStart = new Date(selectedDate);
      const dayOfWeek = weekStart.getDay();
      const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 1
      weekStart.setDate(weekStart.getDate() - daysToSubtract);
      onWeekChange(weekStart);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onWeekChange(previous)}
          className="btn-secondary"
          aria-label="Previous week"
        >
          ← Previous
        </button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Week of {formatDateDisplay(currentWeekStart)}
          </h2>
          <div className="text-sm text-gray-600 mt-1">
            {formatDayOfWeek(currentWeekStart)} - {formatDayOfWeek(new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000))}
          </div>
          <input
            type="date"
            onChange={handleDateInput}
            className="mt-2 text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Jump to date"
          />
        </div>
        
        <button
          onClick={() => onWeekChange(next)}
          className="btn-secondary"
          aria-label="Next week"
        >
          Next →
        </button>
      </div>
    </div>
  );
}