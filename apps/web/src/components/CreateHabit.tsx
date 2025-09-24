import { useState } from 'react';
import { useCreateHabit } from '../hooks/api';
import LoadingSpinner from './LoadingSpinner';

const HABIT_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export default function CreateHabit() {
  const [name, setName] = useState('');
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const createHabitMutation = useCreateHabit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    try {
      await createHabitMutation.mutateAsync({ name: name.trim(), color });
      setName('');
      setColor(HABIT_COLORS[0]);
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to create habit:', error);
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Create New Habit
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="btn-secondary"
          aria-label={isExpanded ? 'Collapse form' : 'Expand form'}
        >
          {isExpanded ? 'Cancel' : '+ Add Habit'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up">
          <div>
            <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
              Habit Name
            </label>
            <input
              id="habit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Drink 8 glasses of water"
              className="input-primary"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={!name.trim() || createHabitMutation.isPending}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createHabitMutation.isPending && <LoadingSpinner />}
              Create Habit
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}