import { Router } from 'express';
import { startOfDay, parseISO, isValid, differenceInDays } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { prisma } from '../server';

export const statsRoutes = Router();

const TIMEZONE = 'Asia/Kolkata';

// Helper function to convert date to UTC for storage
function dateToUTC(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    throw new Error('Invalid date format');
  }
  return zonedTimeToUtc(startOfDay(parsed), TIMEZONE);
}

// Calculate current streak for a habit
async function calculateCurrentStreak(habitId: string, fromDate: Date): Promise<number> {
  const logs = await prisma.habitLog.findMany({
    where: {
      habitId,
      date: { lte: fromDate },
      done: true
    },
    orderBy: { date: 'desc' },
    take: 100 // Reasonable limit for streak calculation
  });

  if (logs.length === 0) return 0;

  let streak = 0;
  let currentDate = new Date(fromDate);
  
  for (const log of logs) {
    const logDate = new Date(log.date);
    const daysDiff = differenceInDays(currentDate, logDate);
    
    if (daysDiff === 0) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (daysDiff === 1) {
      streak++;
      currentDate = new Date(logDate);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break; // Streak broken
    }
  }

  return streak;
}

// GET /api/stats?weekStart=YYYY-MM-DD - Get statistics for a week
statsRoutes.get('/', async (req, res) => {
  try {
    const { weekStart } = req.query;
    
    if (!weekStart || typeof weekStart !== 'string') {
      return res.status(400).json({ error: 'weekStart parameter is required (YYYY-MM-DD)' });
    }

    const startDate = dateToUTC(weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    // Get all habits
    const habits = await prisma.habit.findMany();
    
    // Get logs for the week
    const logs = await prisma.habitLog.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate
        },
        done: true
      }
    });

    // Calculate stats per habit
    const perHabit = await Promise.all(
      habits.map(async (habit) => {
        const habitLogs = logs.filter(log => log.habitId === habit.id);
        const count = habitLogs.length;
        const percent = Math.round((count / 7) * 100);
        
        // Calculate current streak (up to the last day of the week)
        const lastDayOfWeek = new Date(endDate);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() - 1);
        const streak = await calculateCurrentStreak(habit.id, lastDayOfWeek);

        return {
          habitId: habit.id,
          habitName: habit.name,
          count,
          percent,
          streak
        };
      })
    );

    // Calculate overall stats
    const totalPossible = habits.length * 7;
    const totalCompleted = logs.length;
    const totalPercent = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

    const stats = {
      perHabit,
      total: {
        count: totalCompleted,
        possible: totalPossible,
        percent: totalPercent
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error calculating stats:', error);
    if ((error as Error).message.includes('Invalid date')) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    } else {
      res.status(500).json({ error: 'Failed to calculate stats' });
    }
  }
});