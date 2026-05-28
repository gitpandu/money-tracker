import { useState } from 'react';
import { Transaction, Category, Budget, BudgetCycle } from '../types';
import { Strings } from '../utils/i18n';
import { fmtShort } from '../utils/currency';
import { BudgetCard } from '../components/BudgetCard';
import { BudgetModal } from '../components/BudgetModal';

interface Props {
  currentTxns: Transaction[];
  allTxns: Transaction[];
  categories: Category[];
  budgets: Budget[];
  allCycles: BudgetCycle[];
  t: Strings;
  onSaveBudget: (budget: Partial<Budget>) => void;
  onToggleActive: (id: number) => void;
}

export function BudgetsPage({ currentTxns, allTxns, categories, budgets, allCycles, t, onSaveBudget, onToggleActive }: Props) {
  const [editBudget, setEditBudget] = useState<{budget: Budget, catName: string} | null>(null);

  const parents = categories.filter(c => !c.parent_id && c.type === "expense");

  function spentFor(catId: number, txnSet: Transaction[]): number {
    const subs = categories.filter(c => c.parent_id === catId);
    if (subs.length) return subs.reduce((s, c) => s + spentFor(c.id, txnSet), 0);
    return txnSet.filter(tx => tx.category_id === catId && tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  }

  const grandSpent = budgets.filter(b => b.active).reduce((s, b) => s + spentFor(b.category_id, currentTxns), 0);
  const grandLimit = budgets.filter(b => b.active).reduce((s, b) => s + b.limit_amount, 0);
  const grandLeft = Math.max(grandLimit - grandSpent, 0);

  return (
    <div>
      <div className="budget-total-card">
        <div className="bt-cell"><div className="bt-label">{t.budgeted}</div><div className="bt-val">{fmtShort(grandLimit)}</div></div>
        <div className="bt-cell"><div className="bt-label">{t.spent}</div><div className="bt-val" style={{ color: "var(--expense)" }}>{fmtShort(grandSpent)}</div></div>
        <div className="bt-cell"><div className="bt-label">{t.remaining}</div><div className="bt-val" style={{ color: grandLeft > 0 ? "var(--income)" : "var(--expense)" }}>{fmtShort(grandLeft)}</div></div>
      </div>

      {parents.map(p => (
        <BudgetCard
          key={p.id}
          parentCategory={p}
          subCategories={categories.filter(c => c.parent_id === p.id)}
          allTxns={allTxns}
          currentTxns={currentTxns}
          budgets={budgets}
          allCycles={allCycles}
          t={t}
          onToggleActive={onToggleActive}
          onEditBudget={(b, name) => setEditBudget({ budget: b, catName: name })}
        />
      ))}

      {editBudget && (
        <BudgetModal 
          budget={editBudget.budget} 
          catName={editBudget.catName} 
          t={t}
          onClose={() => setEditBudget(null)} 
          onSave={b => { onSaveBudget(b); setEditBudget(null); }} 
        />
      )}
    </div>
  );
}
