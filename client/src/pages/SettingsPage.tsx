import { useState } from 'react';
import { Category, BudgetCycle, Transaction } from '../types';
import { Strings, Language } from '../utils/i18n';
import { exportCSV } from '../utils/exportCsv';
import { txnsInCycle, fmtCycle } from '../utils/dates';
import { Ico } from '../components/icons';
import { CategoryModal } from '../components/CategoryModal';
import { ConfirmModal } from '../components/ConfirmModal';

interface Props {
  categories: Category[];
  cycles: BudgetCycle[];
  activeCycleId: string;
  allTxns: Transaction[];
  lang: Language;
  setLang: (lang: Language) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  shortCurrency: boolean;
  setShortCurrency: (short: boolean) => void;
  cycleDay: number;
  setCycleDay: (day: number) => void;
  carryOver: boolean;
  setCarryOver: (co: boolean) => void;
  copyBudgets: boolean;
  setCopyBudgets: (cb: boolean) => void;
  t: Strings;
  onSaveCategory: (cat: Partial<Category>) => void;
  onDeleteCategory: (id: number) => void;
}

export function SettingsPage({ 
  categories, cycles, activeCycleId, allTxns, 
  lang, setLang, darkMode, setDarkMode, 
  shortCurrency, setShortCurrency,
  cycleDay, setCycleDay, carryOver, setCarryOver, copyBudgets, setCopyBudgets,
  t, onSaveCategory, onDeleteCategory 
}: Props) {
  const [exportCycleId, setExportCycleId] = useState(activeCycleId);

  const [modal, setModal] = useState<{ mode: 'add' | 'edit', cat?: Category } | null>(null);
  const [confirmDel, setConfirmDel] = useState<Category | null>(null);

  function handleExportCSV() {
    const selectedCycle = cycles.find(c => c.id.toString() === exportCycleId);
    if (!selectedCycle) return;
    const exportTxns = txnsInCycle(allTxns, selectedCycle);
    exportCSV(exportTxns, categories, fmtCycle(selectedCycle, lang));
  }

  function CatGroup({ title, type }: { title: string, type: 'income' | 'expense' }) {
    const parents = categories.filter(c => c.type === type && !c.parent_id);
    return (
      <>
        <div className="cat-section-hd">
          <span className="cat-section-title">{title}</span>
          <button className="add-btn" onClick={() => setModal({ mode: "add" })}>{t.addCat}</button>
        </div>
        <div className="card">
          {parents.length === 0 && <div className="empty-state">{t.noneYet}</div>}
          {parents.map(p => {
            const subs = categories.filter(c => c.parent_id === p.id);
            return (
              <div key={p.id}>
                <div className="cat-row">
                  <div className="cat-icon-box">{p.icon || "?"}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="cat-name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {p.name}
                      <span className={`cat-chip ${type === "income" ? "inc" : "exp"}`}>{type === "income" ? t.income : t.expense}</span>
                    </div>
                    {subs.length > 0 && <div className="cat-meta">{subs.length} {t.subCats}</div>}
                  </div>
                  <div className="cat-acts">
                    <button className="icon-btn" onClick={() => setModal({ mode: "edit", cat: p })}>{Ico.edit}</button>
                    <button className="icon-btn del" onClick={() => setConfirmDel(p)}>{Ico.trash}</button>
                  </div>
                </div>
                {subs.map(s => (
                  <div className="cat-row" key={s.id} style={{ paddingLeft: 32, background: "var(--cream)" }}>
                    <div className="sub-color-swatch" style={{ background: s.color, borderRadius: 8 }} />
                    <div style={{ flex: 1 }}><div className="cat-name" style={{ fontSize: 12.5 }}>{s.name}</div></div>
                    <div className="cat-acts">
                      <button className="icon-btn" onClick={() => setModal({ mode: "edit", cat: s })}>{Ico.edit}</button>
                      <button className="icon-btn del" onClick={() => setConfirmDel(s)}>{Ico.trash}</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div>
      <p className="section-lbl">{t.cycleSetting}</p>
      <div className="card" style={{ padding: "0 16px" }}>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.resetDay}</div><div className="setting-desc">{t.resetDayDesc}</div></div>
          <input className="field-input" type="number" min={1} max={28} value={cycleDay}
            onChange={e => setCycleDay(Number(e.target.value))}
            style={{ width: 58, textAlign: "center", fontFamily: "var(--display)", fontSize: 16, padding: "6px" }} />
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.carryOver}</div><div className="setting-desc">{t.carryOverDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={carryOver} onChange={e => setCarryOver(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.copyBudgets}</div><div className="setting-desc">{t.copyBudgetsDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={copyBudgets} onChange={e => setCopyBudgets(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.darkMode}</div><div className="setting-desc">{t.darkModeDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.shortCurrency}</div><div className="setting-desc">{t.shortCurrencyDesc}</div></div>
          <label className="toggle-wrap"><input type="checkbox" checked={shortCurrency} onChange={e => setShortCurrency(e.target.checked)} /><span className="toggle-slider" /></label>
        </div>
        <div className="setting-row">
          <div><div className="setting-lbl">{t.language}</div></div>
          <div style={{ display: "flex", gap: 6 }}>
            {(["en", "id"] as Language[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--body)", transition: "all .1s",
                border: `1.5px solid ${lang === l ? "var(--terra)" : "var(--stone2)"}`,
                background: lang === l ? "var(--terra)" : "transparent",
                color: lang === l ? "#fff" : "var(--ink2)",
              }}>{l === "en" ? "English" : "Indonesia"}</button>
            ))}
          </div>
        </div>
      </div>

      <p className="section-lbl">{t.exportCSV}</p>
      <div className="card" style={{ padding: "12px 16px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <div className="select-wrap">
            <select className="field-input" value={exportCycleId} onChange={(e) => setExportCycleId(e.target.value)} style={{ flex: 1 }}>
              {cycles.map((c) => (<option key={c.id} value={c.id}>{fmtCycle(c, lang)}</option>))}
            </select>
            <div className="select-arrow">{Ico.chevron}</div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: "var(--ink3)", marginBottom: 10 }}>
          {t.exportDesc} ({fmtCycle(cycles.find((c) => c.id.toString() === exportCycleId), lang)})
        </div>

        <button className="export-btn" onClick={handleExportCSV}>
          {Ico.download}
          {t.exportCSV} —{" "}
          {fmtCycle(cycles.find((c) => c.id.toString() === exportCycleId), lang)}
        </button>
      </div>

      <CatGroup title={t.expenseCats} type="expense" />
      <div style={{ height: 6 }} />
      <CatGroup title={t.incomeCats} type="income" />

      {modal && (
        <CategoryModal
          categories={categories}
          initial={modal.mode === "edit" ? modal.cat || null : null}
          t={t}
          onClose={() => setModal(null)}
          onSave={cat => { onSaveCategory(cat); setModal(null); }}
        />
      )}

      {confirmDel && (
        <ConfirmModal
          title={t.deleteConfirmTitle(confirmDel.name)}
          body={t.deleteConfirmBody}
          t={t}
          onClose={() => setConfirmDel(null)}
          onConfirm={() => { onDeleteCategory(confirmDel.id); setConfirmDel(null); }}
        />
      )}
    </div>
  );
}
