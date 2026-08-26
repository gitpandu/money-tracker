import { useState, useCallback } from 'react';
import { Goal, GoalContribution } from '../types';
import { Ico } from './icons';
import { fmtShort } from '../utils/currency';
import { Strings } from '../utils/i18n';
import { GoalContributionModal } from './GoalContributionModal';

interface Props {
  goal: Goal;
  t: Strings;
  shortCurrency: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  onAddContribution: (goalId: number, amount: number, note?: string, date?: string) => Promise<unknown>;
  onDeleteContribution: (goalId: number, contribId: number) => Promise<void>;
  onGetContributions: (goalId: number) => Promise<GoalContribution[]>;
}

export function GoalCard({ goal: g, t, shortCurrency, onEdit, onDelete, onAddContribution, onDeleteContribution, onGetContributions }: Props) {
  const [showContributions, setShowContributions] = useState(false);
  const [history, setHistory] = useState<GoalContribution[]>([]);

  const pct = Math.min((g.saved / g.target) * 100, 100);
  const done = g.saved >= g.target;

  const loadHistory = useCallback(async () => {
    const data = await onGetContributions(g.id);
    setHistory(data);
  }, [g.id, onGetContributions]);

  async function openContributions() {
    await loadHistory();
    setShowContributions(true);
  }

  return (
    <div className="goal-card">
      <div className="goal-head">
        <div className="goal-icon-box" style={{ background: g.color + '22', border: `2px solid ${g.color}44` }}>{g.icon}</div>
        <div className="goal-name">{g.name}</div>
        <div className="goal-acts">
          <button className="icon-btn" onClick={() => onEdit(g)}>{Ico.edit}</button>
          <button className="icon-btn del" onClick={() => onDelete(g.id)}>{Ico.trash}</button>
        </div>
      </div>

      <div className="goal-amounts">
        <span className="goal-saved">{fmtShort(g.saved, shortCurrency)}</span>
        <span className="goal-target">{t.of} {fmtShort(g.target, shortCurrency)}</span>
      </div>
      <div className="track">
        <div className="track-fill" style={{ width: `${pct}%`, background: done ? 'var(--income)' : g.color }} />
      </div>
      <div className="track-status" style={{ color: done ? 'var(--income)' : 'var(--ink3)' }}>
        {done ? 'Goal reached!' : `${pct.toFixed(0)}% - ${fmtShort(g.target - g.saved, shortCurrency)} ${t.remaining}`}
      </div>
      {g.deadline && <div className="goal-deadline">{g.deadline}</div>}

      <button className="goal-history-toggle" onClick={openContributions}>
        {Ico.chart} {t.addContrib} / {t.history}
      </button>

      {showContributions && (
        <GoalContributionModal
          goal={g}
          t={t}
          shortCurrency={shortCurrency}
          initialHistory={history}
          onClose={() => setShowContributions(false)}
          onAddContribution={onAddContribution}
          onDeleteContribution={onDeleteContribution}
          onGetContributions={onGetContributions}
        />
      )}
    </div>
  );
}
