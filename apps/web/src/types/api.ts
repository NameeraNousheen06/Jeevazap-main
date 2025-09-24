// Types for the API responses
export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  done: boolean;
  habit?: Habit;
}

export interface HabitStats {
  habitId: string;
  habitName: string;
  count: number;
  percent: number;
  streak: number;
}

export interface WeeklyStats {
  perHabit: HabitStats[];
  total: {
    count: number;
    possible: number;
    percent: number;
  };
}

// API request types
export interface CreateHabitRequest {
  name: string;
  color?: string;
}

export interface UpdateHabitRequest {
  name?: string;
  color?: string;
}

export interface ToggleLogRequest {
  habitId: string;
  date: string; // YYYY-MM-DD format
}