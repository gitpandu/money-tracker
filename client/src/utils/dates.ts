import type { Transaction, BudgetCycle } from '../../../shared/types';

export function txnsInCycle(txns: Transaction[], cycle: BudgetCycle | undefined) {
  if (!cycle) return txns;
  return txns.filter(t => t.date >= cycle.start_date && t.date <= cycle.end_date);
}

export function fmtCycle(cycle: BudgetCycle | undefined, lang: string, short: boolean = false) {
  if (!cycle) return '';
  const start = new Date(cycle.start_date);
  const end = new Date(cycle.end_date);
  
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  
  if (short) {
    // Short range: "25 Jun - 24 Jul"
    const s = start.toLocaleString(lang, opts);
    const e = end.toLocaleString(lang, opts);
    return `${s} - ${e}`;
  }

  // Full range: "Jun 25 - Jul 24, 2026"
  if (start.getFullYear() !== end.getFullYear()) opts.year = 'numeric';
  const startLabel = start.toLocaleString(lang, opts);
  const endLabel = end.toLocaleString(lang, { month: 'short', day: 'numeric', year: 'numeric' });
  
  return `${startLabel} - ${endLabel}`;
}
