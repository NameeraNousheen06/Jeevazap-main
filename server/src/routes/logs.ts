import { Router } from 'express';
import { startOfDay, parseISO, isValid } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { prisma } from '../server';

export const logRoutes = Router();

const TIMEZONE = 'Asia/Kolkata';

// Helper function to convert date to UTC for storage
function dateToUTC(dateStr: string): Date {
  const parsed = parseISO(dateStr);
  if (!isValid(parsed)) {
    throw new Error('Invalid date format');
  }
  // Convert local midnight to UTC
  return zonedTimeToUtc(startOfDay(parsed), TIMEZONE);
}

// GET /api/logs?weekStart=YYYY-MM-DD - Get logs for a week
logRoutes.get('/', async (req, res) => {
  try {
    const { weekStart } = req.query;
    
    if (!weekStart || typeof weekStart !== 'string') {
      return res.status(400).json({ error: 'weekStart parameter is required (YYYY-MM-DD)' });
    }

    const startDate = dateToUTC(weekStart);
    // Add 7 days for week end
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const logs = await prisma.habitLog.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate
        }
      },
      include: {
        habit: true
      },
      orderBy: [
        { habit: { name: 'asc' } },
        { date: 'asc' }
      ]
    });

    res.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    if ((error as Error).message.includes('Invalid date')) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    } else {
      res.status(500).json({ error: 'Failed to fetch logs' });
    }
  }
});

// PUT /api/logs/toggle - Toggle habit completion for a day
logRoutes.put('/toggle', async (req, res) => {
  try {
    const { habitId, date } = req.body;

    if (!habitId || !date) {
      return res.status(400).json({ error: 'habitId and date are required' });
    }

    const utcDate = dateToUTC(date);

    // Check if habit exists
    const habit = await prisma.habit.findUnique({
      where: { id: habitId }
    });

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' });
    }

    // Find existing log or create new one
    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: utcDate
        }
      }
    });

    let log;
    if (existingLog) {
      // Toggle existing log
      log = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { done: !existingLog.done }
      });
    } else {
      // Create new log (default to done = true when creating)
      log = await prisma.habitLog.create({
        data: {
          habitId,
          date: utcDate,
          done: true
        }
      });
    }

    res.json(log);
  } catch (error) {
    console.error('Error toggling log:', error);
    if ((error as Error).message.includes('Invalid date')) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    } else {
      res.status(500).json({ error: 'Failed to toggle log' });
    }
  }
});