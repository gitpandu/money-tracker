import { useState } from 'react';
import { Category, Transaction, ReceiptData } from '../types';
import { Ico } from './icons';
import { fmt, fmtShort } from '../utils/currency';
import { Strings } from '../utils/i18n';
import { ReceiptPreview } from './ReceiptPreview';
import { TransactionModal } from './TransactionModal';

interface Props {
  txns: Transaction[];
  categories: Category[];
  t: Strings;
  shortCurrency: boolean;
  onSave: (tx: any, receipt?: ReceiptData | null, removeReceipt?: boolean) => void;
  onDelete: (id: number) => void;
}

export function TransactionList({ txns, categories, t, shortCurrency, onSave, onDelete }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [modal, setModal] = useState<Transaction | null>(null);

  const list = txns.filter(x => {
    if (filter !== "all" && x.type !== filter) return false;
    if (query) {
      const cat = categories.find(c => c.id === x.category_id);
      const q = query.toLowerCase();
      if (!x.note.toLowerCase().includes(q) && !(cat?.name || "").toLowerCase().includes(q)) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const groupedList = list.reduce((acc, x) => {
    (acc[x.date] = acc[x.date] || []).push(x);
    return acc;
  }, {} as Record<string, Transaction[]>);

  const getCat = (id: number) => categories.find(c => c.id === id);

  function TxnIcon({ cat }: { cat?: Category }) {
    if (!cat) return <div className="txn-icon txn-icon-emoji">?</div>;
    if (!cat.parent_id) return <div className="txn-icon txn-icon-emoji">{cat.icon || "?"}</div>;
    return (
      <div className="txn-icon" style={{ background: cat.color + "22", border: `2px solid ${cat.color}44` }}>
        <div style={{ width: 14, height: 14, borderRadius: 4, background: cat.color }} />
      </div>
    );
  }

  function catLabel(cat?: Category) {
    if (!cat) return t.uncategorized;
    if (cat.parent_id) {
      const p = getCat(cat.parent_id);
      return p ? `${p.name} · ${cat.name}` : cat.name;
    }
    return cat.name;
  }

  return (
    <>
      <div className="search-wrap">
        <span className="search-ico">{Ico.search}</span>
        <input className="search-input" value={query} onChange={e => setQuery(e.target.value)} placeholder={t.search} />
        {query && <button className="search-clear" onClick={() => setQuery("")}>{Ico.close}</button>}
      </div>

      <div className="filter-row">
        {["all", "income", "expense"].map(f => (
          <button key={f} className={`pill ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
            {f === "all" ? t.all : f === "income" ? t.income : t.expense}
          </button>
        ))}
      </div>

      <div className="card">
        {list.length === 0 && <div className="empty-state">{t.noTxns}</div>}
        {Object.entries(groupedList).map(([date, txns]) => (
          <div key={date}>
            <div className="txn-date-header">{date}</div>
            {txns.map(x => {
              const cat = getCat(x.category_id);
              const open = expanded === x.id;
              return (
                <div key={x.id}>
                  <div className="txn-row" onClick={() => setExpanded(open ? null : x.id)}>
                    <TxnIcon cat={cat} />
                    <div className="txn-body">
                      <div className="txn-note">{x.note || cat?.name}</div>
                      <div className="txn-sub">
                        <span>{catLabel(cat)}</span>
                        {x.receipt_path && (
                          <span className="receipt-chip" onClick={e => { e.stopPropagation(); setPreview(x.receipt_path!); }}>
                            {Ico.img} {t.receipt}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className={`txn-amt ${x.type === "income" ? "inc" : "exp"}`}>
                      {x.type === "income" ? "+" : "−"}{fmtShort(x.amount, shortCurrency)}
                    </div>
                  </div>
                  {open && (
                    <div className="txn-expand">
                      <div className="txn-expand-full">{fmt(x.amount)}</div>
                      <div className="txn-expand-acts">
                        <button className="act-btn" onClick={() => { setModal(x); setExpanded(null); }}>{Ico.edit} Edit</button>
                        <button className="act-btn danger" onClick={() => { onDelete(x.id); setExpanded(null); }}>{Ico.trash} {t.delete}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {modal && <TransactionModal categories={categories} initial={modal} t={t} onClose={() => setModal(null)} onSave={onSave} />}
      {preview && <ReceiptPreview path={preview} t={t} onClose={() => setPreview(null)} />}
    </>
  );
}
