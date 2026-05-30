import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Goal } from '../types';

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const loadGoals = useCallback(async () => {
    try {
      const data = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function save(goal: Partial<Goal>) {
    if (goal.id) {
      const updated = await api.updateGoal(goal.id, goal);
      setGoals(prev => prev.map(g => g.id === updated.id ? updated : g));
      return updated;
    } else {
      const created = await api.createGoal(goal);
      setGoals(prev => [...prev, created]);
      return created;
    }
  }

  async function remove(id: number) {
    await api.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  }

  async function contribute(id: number, amount: number) {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;
    const newSaved = Math.min(goal.saved + amount, goal.target);
    return save({ ...goal, saved: newSaved });
  }

  return { goals, save, remove, contribute, refresh: loadGoals };
}
