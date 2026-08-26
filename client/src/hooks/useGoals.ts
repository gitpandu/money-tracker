import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Goal, GoalContribution } from '../types';

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

  async function addContribution(goalId: number, amount: number, note?: string, date?: string) {
    const result = await api.createGoalContribution(goalId, { amount, note, date });
    setGoals(prev => prev.map(g => g.id === goalId ? result.goal : g));
    return result;
  }

  async function deleteContribution(goalId: number, contribId: number) {
    const result = await api.deleteGoalContribution(goalId, contribId);
    setGoals(prev => prev.map(g => g.id === goalId ? result.goal : g));
  }

  async function getContributions(goalId: number): Promise<GoalContribution[]> {
    return api.getGoalContributions(goalId);
  }

  return { goals, save, remove, addContribution, deleteContribution, getContributions, refresh: loadGoals };
}
