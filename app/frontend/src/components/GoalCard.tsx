import { useState, useCallback } from 'react';
import { Goal, GoalContribution } from '../types';
import { Ico } from './icons';
import { fmtShort } from '../utils/currency';
import { Strings } from '../utils/i18n';

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
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<GoalContribution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const pct = Math.min((g.saved / g.target) * 100, 100);
  const done = g.saved >= g.target;

  async function handleContribute() {
    const raw = parseInt(amount);
    if (!raw || raw <= 0) return;
    const signed = isWithdraw ? -raw : raw;
    await onAddContribution(g.id, signed, note.trim() || undefined, date || undefined);
    setAmount('');
    setNote('');
    setDate('');
    if (showHistory) loadHistory();
  }

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const data = await onGetContributions(g.id);
      setHistory(data);
    } finally {
      setLoadingHistory(false);
    }
  }, [g.id, onGetContributions]);

  async function toggleHistory() {
    if (!showHistory) await loadHistory();
    setShowHistory(h => !h);
  }

  async function handleDeleteContrib(contribId: number) {
    await onDeleteContribution(g.id, contribId);
    setHistory(prev => prev.filter(c => c.id !== contribId));
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
        {done ? '✓ Goal reached!' : `${pct.toFixed(0)}% — ${fmtShort(g.target - g.saved, shortCurrency)} ${t.remaining}`}
      </div>
      {g.deadline && <div className="goal-deadline">🗓 {g.deadline}</div>}

      <div className="goal-contrib-row">
        <div className="contrib-type-toggle">
          <button
            className={`contrib-type-btn ${!isWithdraw ? 'active deposit' : ''}`}
            onClick={() => setIsWithdraw(false)}
          >+ {t.deposit}</button>
          <button
            className={`contrib-type-btn ${isWithdraw ? 'active withdraw' : ''}`}
            onClick={() => setIsWithdraw(true)}
          >− {t.withdraw}</button>
        </div>
        <div className="contrib-inputs">
          <input
            className="contrib-input"
            type="number"
            placeholder={t.contribAmount}
            value={amount}
            min="1"
            onChange={e => setAmount(e.target.value)}
          />
          <input
            className="contrib-input contrib-note"
            type="text"
            placeholder={t.contribNote}
            value={note}
            onChange={e => setNote(e.target.value)}
          />
          <input
            className="contrib-input contrib-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <button
          className={`contrib-btn ${isWithdraw ? 'withdraw' : ''}`}
          onClick={handleContribute}
        >{t.contribute}</button>
      </div>

      <button className="goal-history-toggle" onClick={toggleHistory}>
        {Ico.chart} {t.history} {showHistory ? '▲' : '▼'}
      </button>

      {showHistory && (
        <div className="goal-history">
          {loadingHistory && <div className="history-loading">…</div>}
          {!loadingHistory && history.length === 0 && (
            <div className="history-empty">{t.noHistory}</div>
          )}
          {history.map(c => (
            <div key={c.id} className={`history-row ${c.amount >= 0 ? 'dep' : 'wth'}`}>
              <span className="history-date">{c.date}</span>
              <span className="history-note">{c.note || '—'}</span>
              <span className="history-amount">{c.amount >= 0 ? '+' : ''}{fmtShort(c.amount, shortCurrency)}</span>
              <button className="history-del" onClick={() => handleDeleteContrib(c.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
