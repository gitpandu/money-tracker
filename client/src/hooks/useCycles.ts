import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BudgetCycle } from '../types';

export function useCycles() {
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, []);

  async function loadCycles() {
    setLoading(true);
    try {
      const data = await api.getCycles();
      setCycles(data);
      if (data.length > 0 && !activeCycleId) {
        setActiveCycleId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function create(cycle: Partial<BudgetCycle>) {
    const newCycle = await api.createCycle(cycle);
    setCycles(prev => [newCycle, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)));
    return newCycle;
  }

  return { cycles, activeCycleId, setActiveCycleId, loading, create, refresh: loadCycles };
}
