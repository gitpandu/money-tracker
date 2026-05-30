import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { BudgetCycle } from '../types';

export function useCycles(cycleDay: number = 25) {
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCycles();
  }, [cycleDay]);

  async function loadCycles() {
    setLoading(true);
    try {
      let data = await api.getCycles();
      const now = new Date();
      
      const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      const getExpectedCycle = (date: Date) => {
        let start: Date;
        if (date.getDate() >= cycleDay) {
          start = new Date(date.getFullYear(), date.getMonth(), cycleDay);
        } else {
          start = new Date(date.getFullYear(), date.getMonth() - 1, cycleDay);
        }
        const end = new Date(start.getFullYear(), start.getMonth() + 1, cycleDay - 1);
        return { start, end };
      };

      const todayFmt = fmt(now);
      const { start: expectedStart, end: expectedEnd } = getExpectedCycle(now);
      const expectedStartFmt = fmt(expectedStart);

      // Check if we need to create a new cycle:
      // 1. No cycles exist
      // 2. The latest cycle has ended
      const latestCycle = data[0]; // data is sorted DESC by start_date
      
      if (!latestCycle || todayFmt > latestCycle.end_date) {
        const label = expectedEnd.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const newCycle = await api.createCycle({
          label,
          start_date: expectedStartFmt,
          end_date: fmt(expectedEnd)
        });
        
        // Add new cycle to the list
        data = [newCycle, ...data];
      }

      setCycles(data);
      if (data.length > 0) {
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
