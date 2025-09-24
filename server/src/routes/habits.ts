import { Router } from 'express';
import { prisma } from '../server';

export const habitRoutes = Router();

// GET /api/habits - List all habits
habitRoutes.get('/', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ error: 'Failed to fetch habits' });
  }
});

// POST /api/habits - Create a new habit
habitRoutes.post('/', async (req, res) => {
  try {
    const { name, color = '#22c55e' } = req.body;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Habit name is required' });
    }

    const habit = await prisma.habit.create({
      data: {
        name: name.trim(),
        color
      }
    });

    res.status(201).json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ error: 'Failed to create habit' });
  }
});

// PATCH /api/habits/:id - Update habit
habitRoutes.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const updateData: any = {};
    if (name && typeof name === 'string' && name.trim().length > 0) {
      updateData.name = name.trim();
    }
    if (color && typeof color === 'string') {
      updateData.color = color;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const habit = await prisma.habit.update({
      where: { id },
      data: updateData
    });

    res.json(habit);
  } catch (error) {
    console.error('Error updating habit:', error);
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Habit not found' });
    } else {
      res.status(500).json({ error: 'Failed to update habit' });
    }
  }
});

// DELETE /api/habits/:id - Delete habit
habitRoutes.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.habit.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting habit:', error);
    if ((error as any).code === 'P2025') {
      res.status(404).json({ error: 'Habit not found' });
    } else {
      res.status(500).json({ error: 'Failed to delete habit' });
    }
  }
});