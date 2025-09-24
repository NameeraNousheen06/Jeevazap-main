import { 
  Habit, 
  HabitLog, 
  WeeklyStats, 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  ToggleLogRequest 
} from '../types/api';

const API_BASE = '/api';

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
    apiRequest<Habit[]>('/habits'),

  // Create a new habit
  create: (data: CreateHabitRequest): Promise<Habit> =>
    apiRequest<Habit>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update a habit
  update: (id: string, data: UpdateHabitRequest): Promise<Habit> =>
    apiRequest<Habit>(`/habits/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  // Delete a habit
  delete: (id: string): Promise<void> =>
    apiRequest<void>(`/habits/${id}`, {
      method: 'DELETE',
    }),
};

// Log API functions
export const logApi = {
  // Get logs for a week
  getWeek: (weekStart: string): Promise<HabitLog[]> =>
    apiRequest<HabitLog[]>(`/logs?weekStart=${weekStart}`),

  // Toggle a habit log
  toggle: (data: ToggleLogRequest): Promise<HabitLog> =>
    apiRequest<HabitLog>('/logs/toggle', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// Stats API functions
export const statsApi = {
  // Get weekly statistics
  getWeek: (weekStart: string): Promise<WeeklyStats> =>
    apiRequest<WeeklyStats>(`/stats?weekStart=${weekStart}`),
};