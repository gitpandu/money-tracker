import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { BudgetCycle } from '../types';
import { Language } from '../utils/i18n';
import { fmtCycle } from '../utils/dates';

export function useCycles(cycleDay: number = 25, lang: Language = 'en') {
  const [cycles, setCycles] = useState<BudgetCycle[]>([]);
  const [activeCycleId, setActiveCycleId] = useState<string>('');

  const loadCycles = useCallback(async () => {
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
      const latestCycle = data[0];

      if (!latestCycle || todayFmt > latestCycle.end_date) {
        const label = fmtCycle({ 
          start_date: fmt(expectedStart), 
          end_date: fmt(expectedEnd) 
        } as any, lang);

        const newCycle = await api.createCycle({
          label,
          start_date: fmt(expectedStart),
          end_date: fmt(expectedEnd)
        });

        data = [newCycle, ...data];
      }

      setCycles(data);
      if (data.length > 0) {
        setActiveCycleId(data[0].id.toString());
      }
    } catch (err) {
      console.error(err);
    }
  }, [cycleDay, lang]);

  useEffect(() => {
    loadCycles();
  }, [loadCycles]);

  async function create(cycle: Partial<BudgetCycle>) {
    const newCycle = await api.createCycle(cycle);
    setCycles(prev => [newCycle, ...prev].sort((a, b) => b.start_date.localeCompare(a.start_date)));
    return newCycle;
  }

  return { cycles, activeCycleId, setActiveCycleId, create, refresh: loadCycles };
}
