import { useState } from 'react';
import type { Habit, HabitLog } from '../types/api';
import { getWeekDates, formatDateForApi, formatDayOfWeek, isFutureDate } from '../lib/dates';
import { useToggleLog } from '../hooks/api';

interface HabitsGridProps {
  habits: Habit[];
  logs: HabitLog[];
  weekStart: Date;
}

export default function HabitsGrid({ habits, logs, weekStart }: HabitsGridProps) {
  const toggleLogMutation = useToggleLog();
  const weekDates = getWeekDates(weekStart);
  const [loading, setLoading] = useState<string>('');

  // Create a map for quick log lookup
  const logMap = new Map<string, boolean>();
  logs.forEach(log => {
    const key = `${log.habitId}-${formatDateForApi(new Date(log.date))}`;
    logMap.set(key, log.done);
  });

  const handleToggle = async (habitId: string, date: Date) => {
    if (isFutureDate(date)) return;

    const toggleKey = `${habitId}-${formatDateForApi(date)}`;
    
    // Prevent multiple simultaneous toggles
    if (loading === toggleKey) return;
    
    setLoading(toggleKey);

    try {
      await toggleLogMutation.mutateAsync({
        habitId,
        date: formatDateForApi(date)
      });
    } catch (error) {
      console.error('Failed to toggle log:', error);
    } finally {
      setLoading('');
    }
  };

  const getCellStatus = (habitId: string, date: Date) => {
    const key = `${habitId}-${formatDateForApi(date)}`;
    const isCompleted = logMap.get(key) || false;
    const isFuture = isFutureDate(date);
    
    return { isCompleted, isFuture };
  };

  if (habits.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500">No habits to display</p>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Weekly Progress
      </h2>
      
      <div className="min-w-full">
        {/* Header with day names */}
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-medium text-gray-600 py-2">
            Habit
          </div>
          {weekDates.map((date, index) => (
            <div key={index} className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                {formatDayOfWeek(date)}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Habit rows */}
        <div className="space-y-3">
          {habits.map((habit) => (
            <div key={habit.id} className="grid grid-cols-8 gap-2 items-center">
              {/* Habit name */}
              <div className="flex items-center gap-2 py-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: habit.color }}
                />
                <span className="text-sm font-medium text-gray-900 truncate">
                  {habit.name}
                </span>
              </div>

              {/* Day cells */}
              {weekDates.map((date, dayIndex) => {
                const { isCompleted, isFuture } = getCellStatus(habit.id, date);
                const toggleKey = `${habit.id}-${formatDateForApi(date)}`;
                const isToggling = loading === toggleKey;

                return (
                  <button
                    key={dayIndex}
                    onClick={() => handleToggle(habit.id, date)}
                    disabled={isFuture || isToggling}
                    className={`
                      h-10 w-full rounded-lg border-2 transition-all
                      ${isFuture 
                        ? 'bg-gray-100 border-gray-200 cursor-not-allowed' 
                        : isCompleted
                          ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
                          : 'bg-red-500 border-red-500 text-white hover:bg-red-600'
                      }
                      ${isToggling ? 'opacity-50' : ''}
                    `}
                  >
                    {loading === toggleKey ? (
                      <span className="animate-spin">⟳</span>
                    ) : isCompleted ? (
                      <span className="text-white font-bold">✓</span>
                    ) : isFuture ? (
                      <span className="text-gray-400">○</span>
                    ) : (
                      <span className="text-white font-bold">✗</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-6 pt-4 border-t text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded flex items-center justify-center">
            <span className="text-white text-xs">✓</span>
          </div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
            <span className="text-white text-xs">✗</span>
          </div>
          <span>Not done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center">
            <span className="text-gray-400">○</span>
          </div>
          <span>Future</span>
        </div>
      </div>
    </div>
  );
}