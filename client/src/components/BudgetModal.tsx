import { useState } from 'react';
import { Budget } from '../types';
import { Strings } from '../utils/i18n';

interface Props {
  budget: Budget;
  catName: string;
  t: Strings;
  onClose: () => void;
  onSave: (b: Budget) => void;
}

export function BudgetModal({ budget, catName, t, onClose, onSave }: Props) {
  const [limit, setLimit] = useState(budget.limit_amount.toString());
  const [note, setNote] = useState(budget.note || "");

  function save() {
    if (!limit) return;
    onSave({ ...budget, limit_amount: parseInt(limit), note });
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{t.editBudget} — {catName}</div>
        <div className="field">
          <label className="field-label">{t.limit}</label>
          <input className="field-input" type="number" value={limit} onChange={e => setLimit(e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">{t.budgetNote}</label>
          <input className="field-input" type="text" value={note} onChange={e => setNote(e.target.value)} />
        </div>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}
