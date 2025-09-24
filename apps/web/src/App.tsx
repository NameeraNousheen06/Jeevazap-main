import { useState } from 'react';
import { getCurrentWeekStart } from './lib/dates';
import { useHabits, useWeekLogs, useWeekStats } from './hooks/api';
import Header from './components/Header';
import WeekNavigation from './components/WeekNavigation';
import CreateHabit from './components/CreateHabit';
import HabitsGrid from './components/HabitsGrid';
import StatsCards from './components/StatsCards';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';

function App() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getCurrentWeekStart());

  // Fetch data
  const { 
    data: habits = [], 
    isLoading: habitsLoading, 
    error: habitsError 
  } = useHabits();
  
  const { 
    data: logs = [], 
    isLoading: logsLoading, 
    error: logsError 
  } = useWeekLogs(currentWeekStart);
  
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError 
  } = useWeekStats(currentWeekStart);

  // Loading state
  const isLoading = habitsLoading || logsLoading || statsLoading;
  
  // Error state
  const error = habitsError || logsError || statsError;

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage 
          message="Failed to load habit tracker data"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Week Navigation */}
        <WeekNavigation 
          currentWeekStart={currentWeekStart}
          onWeekChange={setCurrentWeekStart}
        />

        {/* Stats Cards */}
        {stats && (
          <StatsCards 
            stats={stats}
            isLoading={statsLoading}
          />
        )}

        {/* Create Habit Form */}
        <CreateHabit />

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : habits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No habits yet! Create your first habit above to get started.
            </div>
            <div className="text-gray-400 text-sm">
              Start building healthy habits one day at a time 🌱
            </div>
          </div>
        ) : (
          <HabitsGrid 
            habits={habits}
            logs={logs}
            weekStart={currentWeekStart}
          />
        )}
      </main>
    </div>
  );
}

export default App;