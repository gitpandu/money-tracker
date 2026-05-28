import { Transaction, BudgetCycle } from '../../../shared/types';

export function txnsInCycle(txns: Transaction[], cycle: BudgetCycle | undefined) {
  if (!cycle) return txns;
  return txns.filter(t => t.date >= cycle.start_date && t.date <= cycle.end_date);
}
