import { 
  Habit, 
  HabitLog, 
  HabitStats, 
  WeeklyStats, 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  ToggleLogRequest 
} from '../types/api';

const API_BASE = '/api';
const DEMO_MODE = true; // Set to false when backend is available

// Mock data for demo mode
let mockHabits: Habit[] = [
  {
    id: '1',
    name: 'Drink Water',
    color: 'bg-blue-500',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Exercise',
    color: 'bg-green-500',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Read',
    color: 'bg-purple-500',
    createdAt: new Date().toISOString()
  }
];

let mockLogs: HabitLog[] = [];

// Demo API functions
const demoApi = {
  habits: {
    getAll: (): Promise<Habit[]> => Promise.resolve([...mockHabits]),
    create: (data: CreateHabitRequest): Promise<Habit> => {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: data.name,
        color: data.color || 'bg-gray-500',
        createdAt: new Date().toISOString()
      };
      mockHabits.push(newHabit);
      return Promise.resolve(newHabit);
    },
    update: (id: string, data: UpdateHabitRequest): Promise<Habit> => {
      const habitIndex = mockHabits.findIndex(h => h.id === id);
      if (habitIndex === -1) throw new Error('Habit not found');
      mockHabits[habitIndex] = { ...mockHabits[habitIndex], ...data };
      return Promise.resolve(mockHabits[habitIndex]);
    },
    delete: (id: string): Promise<void> => {
      mockHabits = mockHabits.filter(h => h.id !== id);
      mockLogs = mockLogs.filter(l => l.habitId !== id);
      return Promise.resolve();
    }
  },
  logs: {
    getWeek: (weekStart: string): Promise<HabitLog[]> => {
      return Promise.resolve(mockLogs.filter(log => log.date >= weekStart));
    },
    toggle: (data: ToggleLogRequest): Promise<HabitLog | null> => {
      const existingIndex = mockLogs.findIndex(log => 
        log.habitId === data.habitId && log.date === data.date
      );
      
      if (existingIndex >= 0) {
        mockLogs.splice(existingIndex, 1);
        return Promise.resolve(null);
      } else {
        const newLog: HabitLog = {
          id: Date.now().toString(),
          habitId: data.habitId,
          date: data.date,
          done: true
        };
        mockLogs.push(newLog);
        return Promise.resolve(newLog);
      }
    }
  },
  stats: {
    getWeek: (weekStart: string): Promise<WeeklyStats> => {
      const weekLogs = mockLogs.filter(log => log.date >= weekStart);
      const totalPossible = mockHabits.length * 7;
      const completed = weekLogs.length;
      
      const habitStats: HabitStats[] = mockHabits.map(habit => {
        const habitLogs = weekLogs.filter(log => log.habitId === habit.id);
        return {
          habitId: habit.id,
          habitName: habit.name,
          count: habitLogs.length,
          percent: (habitLogs.length / 7) * 100,
          streak: habitLogs.length
        };
      });
      
      return Promise.resolve({
        perHabit: habitStats,
        total: {
          count: completed,
          possible: totalPossible,
          percent: totalPossible > 0 ? (completed / totalPossible) * 100 : 0
        }
      });
    }
  }
};

// Custom error class for API responses
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic fetch wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
    }

    // Handle 204 No Content responses
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, 'Network error or server unavailable');
  }
}

// Habit API functions
export const habitApi = {
  // Get all habits
  getAll: (): Promise<Habit[]> => 
    DEMO_MODE ? demoApi.habits.getAll() : apiRequest<Habit[]>('/habits'),

  // Create a new habit
  create: (data: CreateHabitRequest): Promise<Habit> =>
    DEMO_MODE ? demoApi.habits.create(data) : apiRequest<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update a habit
  update: (id: string, data: UpdateHabitRequest): Promise<Habit> =>
    DEMO_MODE ? demoApi.habits.update(id, data) : apiRequest<Habit>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a habit
  delete: (id: string): Promise<void> =>
    DEMO_MODE ? demoApi.habits.delete(id) : apiRequest<void>(`/habits/${id}`, {
      method: 'DELETE',
    }),
};

// Log API functions
export const logApi = {
  // Get logs for a week
  getWeek: (weekStart: string): Promise<HabitLog[]> =>
    DEMO_MODE ? demoApi.logs.getWeek(weekStart) : apiRequest<HabitLog[]>(`/logs?weekStart=${weekStart}`),

  // Toggle a habit log
  toggle: (data: ToggleLogRequest): Promise<HabitLog> =>
    DEMO_MODE ? 
      demoApi.logs.toggle(data).then(result => result || { id: '', habitId: '', date: '', done: false }) :
      apiRequest<HabitLog>('/logs/toggle', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
};

// Stats API functions
export const statsApi = {
  // Get weekly statistics
  getWeek: (weekStart: string): Promise<WeeklyStats> =>
    DEMO_MODE ? demoApi.stats.getWeek(weekStart) : apiRequest<WeeklyStats>(`/stats?weekStart=${weekStart}`),
};