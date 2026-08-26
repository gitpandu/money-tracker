import { useState } from 'react';
import { Category, Transaction, ReceiptData } from '../types';
import { Ico } from './icons';
import { Strings } from '../utils/i18n';

interface Props {
  initial: Transaction | null;
  categories: Category[];
  t: Strings;
  onClose: () => void;
  onSave: (tx: any, receipt?: ReceiptData | null, removeReceipt?: boolean) => void;
}

export function TransactionModal({ initial, categories, t, onClose, onSave }: Props) {
  const [type, setType] = useState<"income" | "expense">(initial?.type || "expense");
  const [amount, setAmt] = useState(initial?.amount?.toString() || "");
  const [catId, setCat] = useState(initial?.category_id?.toString() || "");
  const [note, setNote] = useState(initial?.note || "");
  const [date, setDate] = useState(initial?.date || new Date().toISOString().slice(0, 10));
  const [receipt, setReceipt] = useState<ReceiptData | null>(
    initial?.receipt_path ? { src: initial.receipt_path, name: initial.receipt_path.split('/').pop() || 'receipt' } : null
  );
  const [removeReceipt, setRemoveReceipt] = useState(false);

  const cats = categories.filter(c => c.type === type);
  const parents = cats.filter(c => !c.parent_id);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setReceipt({ src: ev.target?.result as string, name: file.name, file });
      setRemoveReceipt(false);
    };
    reader.readAsDataURL(file);
  }

  function save() {
    if (!amount || !catId || !date) return;
    onSave(
      { id: initial?.id, type, amount: parseInt(amount), category_id: parseInt(catId), note, date },
      receipt?.file ? receipt : null,
      removeReceipt
    );
    onClose();
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="sheet-title">{initial ? t.editTransaction : t.newTransaction}</div>
        <div className="field">
          <div className="type-toggle">
            <button className={`type-btn inc ${type === "income" ? "on" : ""}`} onClick={() => { setType("income"); setCat(""); }}>+ {t.income}</button>
            <button className={`type-btn exp ${type === "expense" ? "on" : ""}`} onClick={() => { setType("expense"); setCat(""); }}>− {t.expense}</button>
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="field-label">{t.amount}</label>
            <input className="field-input" type="number" value={amount} onChange={e => setAmt(e.target.value)} placeholder="0" />
          </div>
          <div className="field">
            <label className="field-label">{t.date}</label>
            <input className="field-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.category}</label>
          <div className="select-wrap">
            <select className="field-input" value={catId} onChange={e => setCat(e.target.value)}>
              <option value="">{t.selectCat}</option>
              {parents.map(p => {
                const subs = cats.filter(c => c.parent_id === p.id);
                return subs.length > 0
                  ? <optgroup key={p.id} label={`${p.icon || ""} ${p.name}`}>
                    {subs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </optgroup>
                  : <option key={p.id} value={p.id}>{p.icon || ""} {p.name}</option>;
              })}
            </select>
            <div className="select-arrow">{Ico.chevron}</div>
          </div>
        </div>
        <div className="field">
          <label className="field-label">{t.note}</label>
          <input className="field-input" type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Optional…" />
        </div>
        <div className="field">
          <label className="field-label">{t.receipt}</label>
          {receipt
            ? <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ fontSize: 12, color: "var(--terra)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{receipt.name}</div>
              <button className="icon-btn del" onClick={() => { setReceipt(null); setRemoveReceipt(true); }}>{Ico.close}</button>
            </div>
            : <input className="field-input" type="file" accept="image/*,application/pdf" onChange={handleFile} />
          }
        </div>
        <div className="sheet-btns">
          <button className="btn btn-ghost" onClick={onClose}>{t.cancel}</button>
          <button className="btn btn-primary" onClick={save}>{t.save}</button>
        </div>
      </div>
    </div>
  );
}
