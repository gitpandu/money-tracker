import { useState } from 'react';
import { Goal } from '../types';
import { Ico } from './icons';
import { fmtShort } from '../utils/currency';
import { Strings } from '../utils/i18n';

interface Props {
  goal: Goal;
  t: Strings;
  shortCurrency: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (id: number) => void;
  onContribute: (id: number, amount: number) => void;
}

export function GoalCard({ goal: g, t, shortCurrency, onEdit, onDelete, onContribute }: Props) {
  const [contribAmount, setContribAmount] = useState("");

  const pct = Math.min((g.saved / g.target) * 100, 100);
  const done = g.saved >= g.target;

  function handleContribute() {
    const amt = parseInt(contribAmount);
    if (!amt) return;
    onContribute(g.id, amt);
    setContribAmount("");
  }

  return (
    <div className="goal-card">
      <div className="goal-head">
        <div className="goal-icon-box" style={{ background: g.color + "22", border: `2px solid ${g.color}44` }}>{g.icon}</div>
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
        <div className="track-fill" style={{ width: `${pct}%`, background: done ? "var(--income)" : g.color }} />
      </div>
      <div className="track-status" style={{ color: done ? "var(--income)" : "var(--ink3)" }}>
        {done ? "✓ Goal reached!" : `${pct.toFixed(0)}% — ${fmtShort(g.target - g.saved, shortCurrency)} ${t.remaining}`}
      </div>
      {g.deadline && <div className="goal-deadline">🗓 {g.deadline}</div>}

      {!done && (
        <div className="goal-contrib-row">
          <input className="contrib-input" type="number" placeholder={t.contribAmount}
            value={contribAmount} onChange={e => setContribAmount(e.target.value)} />
          <button className="contrib-btn" onClick={handleContribute}>{t.contribute}</button>
        </div>
      )}
    </div>
  );
}
