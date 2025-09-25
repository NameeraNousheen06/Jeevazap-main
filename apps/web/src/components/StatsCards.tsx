import type { WeeklyStats } from '../types/api';
import LoadingSpinner from './LoadingSpinner';

interface StatsCardsProps {
  stats: WeeklyStats;
  isLoading: boolean;
}

export default function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return <div className="flex justify-center py-8"><LoadingSpinner /></div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Overall Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          This Week Overall
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Completed:</span>
            <span className="font-semibold text-2xl text-green-600">
              {stats.total.count}/{stats.total.possible}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Success Rate:</span>
            <span className="font-semibold text-2xl text-blue-600">
              {stats.total.percent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.total.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Per Habit Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Habit Performance
        </h3>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {stats.perHabit.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No habits yet. Create one to see stats!
            </p>
          ) : (
            stats.perHabit.map((habit) => (
              <div key={habit.habitId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {habit.habitName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {habit.count}/7 days • {habit.percent.toFixed(1)}%
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {habit.streak > 0 && (
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                      🔥 {habit.streak}
                    </span>
                  )}
                  <div className="w-12 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${habit.percent}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}