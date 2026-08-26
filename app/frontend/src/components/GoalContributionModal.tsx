import { useState } from 'react';
import { Goal, GoalContribution } from '../types';
import { fmtShort } from '../utils/currency';
import { Strings } from '../utils/i18n';

interface Props {
  goal: Goal;
  t: Strings;
  shortCurrency: boolean;
  initialHistory: GoalContribution[];
  onClose: () => void;
  onAddContribution: (goalId: number, amount: number, note?: string, date?: string) => Promise<unknown>;
  onDeleteContribution: (goalId: number, contribId: number) => Promise<void>;
  onGetContributions: (goalId: number) => Promise<GoalContribution[]>;
}

function todayInputValue() {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function GoalContributionModal({
  goal,
  t,
  shortCurrency,
  initialHistory,
  onClose,
  onAddContribution,
  onDeleteContribution,
  onGetContributions,
}: Props) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(todayInputValue);
  const [isWithdraw, setIsWithdraw] = useState(false);
  const [history, setHistory] = useState(initialHistory);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const parsedAmount = parseInt(amount, 10);
  const amountInvalid = !Number.isFinite(parsedAmount) || parsedAmount <= 0;
  const amountError = submitted && amountInvalid;
  const dateError = submitted && !date;

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const data = await onGetContributions(goal.id);
      setHistory(data);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleContribute() {
    setSubmitted(true);
    if (amountInvalid || !date) return;

    const signed = isWithdraw ? -parsedAmount : parsedAmount;
    await onAddContribution(goal.id, signed, note.trim() || undefined, date);
    setAmount('');
    setNote('');
    setDate(todayInputValue());
    setSubmitted(false);
    await loadHistory();
  }

  async function handleDeleteContrib(contribId: number) {
    await onDeleteContribution(goal.id, contribId);
    setHistory(prev => prev.filter(c => c.id !== contribId));
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{goal.name}</div>

        <div className="goal-contrib-row">
          <div className="contrib-type-toggle">
            <button
              className={`contrib-type-btn ${!isWithdraw ? 'active deposit' : ''}`}
              onClick={() => setIsWithdraw(false)}
            >+ {t.deposit}</button>
            <button
              className={`contrib-type-btn ${isWithdraw ? 'active withdraw' : ''}`}
              onClick={() => setIsWithdraw(true)}
            >- {t.withdraw}</button>
          </div>
          <div className="contrib-inputs">
            <input
              className={`contrib-input ${amountError ? 'error' : ''}`}
              type="number"
              placeholder={t.contribAmount}
              value={amount}
              min="1"
              onChange={e => setAmount(e.target.value)}
            />
            {amountError && <div className="field-error">{t.positiveAmountRequired}</div>}
            <input
              className="contrib-input contrib-note"
              type="text"
              placeholder={t.contribNote}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <input
              className={`contrib-input contrib-date ${dateError ? 'error' : ''}`}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
            {dateError && <div className="field-error">{t.requiredField}</div>}
          </div>
          <button
            className={`contrib-btn ${isWithdraw ? 'withdraw' : ''}`}
            onClick={handleContribute}
          >{t.contribute}</button>
        </div>

        <div className="goal-history">
          <div className="goal-history-title">{t.history}</div>
          {loadingHistory && <div className="history-loading">...</div>}
          {!loadingHistory && history.length === 0 && (
            <div className="history-empty">{t.noHistory}</div>
          )}
          {history.map(c => (
            <div key={c.id} className={`history-row ${c.amount >= 0 ? 'dep' : 'wth'}`}>
              <span className="history-date">{c.date}</span>
              <span className="history-note">{c.note || '-'}</span>
              <span className="history-amount">{c.amount >= 0 ? '+' : ''}{fmtShort(c.amount, shortCurrency)}</span>
              <button className="history-del" onClick={() => handleDeleteContrib(c.id)}>x</button>
            </div>
          ))}
        </div>

        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
        </div>
      </div>
    </div>
  );
}
