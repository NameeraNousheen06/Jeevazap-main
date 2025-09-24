import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { habitApi, logApi, statsApi } from '../lib/api';
import { formatDateForApi, getWeekStart } from '../lib/dates';
import type { CreateHabitRequest, UpdateHabitRequest } from '../types/api';

// Query keys
export const queryKeys = {
  habits: ['habits'] as const,
  logs: (weekStart: string) => ['logs', weekStart] as const,
  stats: (weekStart: string) => ['stats', weekStart] as const,
};

// Habit hooks
export function useHabits() {
  return useQuery({
    queryKey: queryKeys.habits,
    queryFn: habitApi.getAll,
  });
}

export function useCreateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: habitApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
    },
  });
}

export function useUpdateHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateHabitRequest }) =>
      habitApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
    },
  });
}

export function useDeleteHabit() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: habitApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.habits });
      // Also invalidate logs and stats since they depend on habits
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

// Log hooks
export function useWeekLogs(weekStart: Date) {
  const weekStartStr = formatDateForApi(weekStart);
  
  return useQuery({
    queryKey: queryKeys.logs(weekStartStr),
    queryFn: () => logApi.getWeek(weekStartStr),
  });
}

export function useToggleLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: logApi.toggle,
    onSuccess: (_, variables) => {
      // Invalidate the week that contains this log
      const date = new Date(variables.date);
      const weekStart = getWeekStart(date);
      const weekStartStr = formatDateForApi(weekStart);
      queryClient.invalidateQueries({ queryKey: queryKeys.logs(weekStartStr) });
      queryClient.invalidateQueries({ queryKey: queryKeys.stats(weekStartStr) });
    },
  });
}

// Stats hooks
export function useWeekStats(weekStart: Date) {
  const weekStartStr = formatDateForApi(weekStart);
  
  return useQuery({
    queryKey: queryKeys.stats(weekStartStr),
    queryFn: () => statsApi.getWeek(weekStartStr),
  });
}