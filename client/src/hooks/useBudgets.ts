import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Budget } from '../types';

export function useBudgets(cycleId?: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);

  const loadBudgets = useCallback(async () => {
    try {
      const data = await api.getBudgets(cycleId);
      setBudgets(data);
    } catch (err) {
      console.error(err);
    }
  }, [cycleId]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  async function save(budget: Partial<Budget>) {
    if (budget.id) {
      const updated = await api.updateBudget(budget.id, budget);
      setBudgets(prev => prev.map(b => b.id === updated.id ? updated : b));
      return updated;
    } else {
      const created = await api.createBudget(budget);
      setBudgets(prev => [...prev, created]);
      return created;
    }
  }

  async function toggleActive(id: number) {
    const budget = budgets.find(b => b.id === id);
    if (!budget) return;
    return save({ ...budget, active: budget.active ? 0 : 1 });
  }

  return { budgets, save, toggleActive, refresh: loadBudgets };
}
