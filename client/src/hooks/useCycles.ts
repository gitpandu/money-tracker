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
      
      if (data.length === 0) {
        const now = new Date();
        let start: Date;
        
        if (now.getDate() >= cycleDay) {
          start = new Date(now.getFullYear(), now.getMonth(), cycleDay);
        } else {
          start = new Date(now.getFullYear(), now.getMonth() - 1, cycleDay);
        }

        const end = new Date(start.getFullYear(), start.getMonth() + 1, cycleDay - 1);
        
        // Label using the month where the cycle ends (usually the "main" month)
        const label = end.toLocaleString('default', { month: 'long', year: 'numeric' });
        
        const fmt = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        };

        const start_date = fmt(start);
        const end_date = fmt(end);
        
        const newCycle = await api.createCycle({
          label,
          start_date,
          end_date
        });
        data = [newCycle];
      }

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
