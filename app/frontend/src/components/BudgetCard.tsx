import { Category, Budget, Transaction, BudgetCycle } from '../types';
import { Ico } from './icons';
import { fmtShort } from '../utils/currency';
import { txnsInCycle, fmtCycle } from '../utils/dates';
import { Strings, Language } from '../utils/i18n';
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';

interface Props {
  parentCategory: Category;
  subCategories: Category[];
  allTxns: Transaction[];
  currentTxns: Transaction[];
  budgets: Budget[];
  allCycles: BudgetCycle[];
  t: Strings;
  lang: Language;
  shortCurrency: boolean;
  canCreateBudget: boolean;
  onCreateBudget: (category: Category) => void;
  onToggleActive: (id: number) => void;
  onEditBudget: (budget: Budget, catName: string) => void;
}

export function BudgetCard({ parentCategory, subCategories, allTxns, currentTxns, budgets, allCycles, t, lang, shortCurrency, canCreateBudget, onCreateBudget, onToggleActive, onEditBudget }: Props) {
  function spentFor(catId: number, txnSet: Transaction[]): number {
    const subs = subCategories.filter(c => c.parent_id === catId);
    if (subs.length) return subs.reduce((s, c) => s + spentFor(c.id, txnSet), 0);
    return txnSet.filter(tx => tx.category_id === catId && tx.type === "expense").reduce((s, tx) => s + tx.amount, 0);
  }

  function budgetFor(catId: number) { return budgets.find(b => b.category_id === catId); }

  const totalSpent = spentFor(parentCategory.id, currentTxns);
  const activeBdgs = subCategories.length
    ? subCategories.map(s => budgetFor(s.id)).filter(b => b?.active)
    : [budgetFor(parentCategory.id)].filter(b => b?.active);
  const totalLimit = activeBdgs.reduce((s, b) => s + (b?.limit_amount || 0), 0);

  // Sparkline data (last 5 cycles)
  const spark = [...allCycles].reverse().slice(-5).map(cyc => {
    const cycTxns = txnsInCycle(allTxns, cyc);
    const total = subCategories.length
      ? subCategories.reduce((s, c) => s + spentFor(c.id, cycTxns), 0)
      : spentFor(parentCategory.id, cycTxns);
    return { 
      cycle: fmtCycle(cyc, lang, true), 
      fullLabel: fmtCycle(cyc, lang),
      val: total 
    };
  });

  function BudgetBar({ spent, budget }: { spent: number, budget?: Budget }) {
    if (!budget) return <div style={{ fontSize: 11, color: "var(--ink3)" }}>{t.noLimit}</div>;
    if (!budget.active) return <div style={{ fontSize: 11, color: "var(--ink3)" }}>{t.excluded}</div>;
    const lim = budget.limit_amount, pct = Math.min((spent / lim) * 100, 100);
    const over = spent > lim, warn = pct >= 80;
    const fill = over ? "var(--expense)" : warn ? "var(--warn)" : "var(--sage)";
    return (
      <>
        <div className="track"><div className="track-fill" style={{ width: `${pct}%`, background: fill }} /></div>
        <div className="track-status" style={{ color: over ? "var(--expense)" : warn ? "var(--warn)" : "var(--ink3)" }}>
          {over
            ? <><span className="over-badge">{t.over}</span>{fmtShort(spent - lim, shortCurrency)} {t.overLimit}</>
            : `${fmtShort(spent, shortCurrency)} ${t.of} ${fmtShort(lim, shortCurrency)} — ${pct.toFixed(0)}%`}
        </div>
        {budget.note ? <div className="bsub-note">{budget.note}</div> : null}
      </>
    );
  }

  const items = subCategories.length > 0 ? subCategories : [parentCategory];

  return (
    <div className="bblock">
      <div className="bblock-head">
        <span className="bblock-head-icon">{parentCategory.icon || "•"}</span>
        <span className="bblock-head-name">{parentCategory.name}</span>
        <span className="bblock-head-total">{fmtShort(totalSpent, shortCurrency)}{totalLimit > 0 ? ` / ${fmtShort(totalLimit, shortCurrency)}` : ""}</span>
      </div>

      {items.map(item => {
        const b = budgetFor(item.id);
        const sp = spentFor(item.id, currentTxns);
        return (
          <div className={`bsub ${b && !b.active ? "bsub-inactive" : ""}`} key={item.id}>
            <div className="bsub-top">
              <span className="bsub-name">
                {subCategories.length > 0 && <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />}
                {subCategories.length > 0 ? item.name : (item.icon || "") + " " + item.name}
              </span>
              <div className="bsub-acts">
                {b ? (
                  <>
                    <button className={`bsub-toggle ${b.active ? "on" : ""}`} onClick={() => onToggleActive(b.id)}>{b.active ? <>{Ico.check} {t.on}</> : t.off}</button>
                    <button className="icon-btn" onClick={() => onEditBudget(b, item.name)}>{Ico.edit}</button>
                  </>
                ) : (
                  <button className="bsub-toggle" disabled={!canCreateBudget} onClick={() => onCreateBudget(item)}>
                    {Ico.plus} {t.setBudget}
                  </button>
                )}
              </div>
            </div>
            <BudgetBar spent={sp} budget={b} />
          </div>
        );
      })}

      <div style={{ padding: "8px 14px 12px" }}>
        <div className="sparkline-label">{t.trend}</div>
        <ResponsiveContainer width="100%" height={88}>
          <LineChart data={spark} margin={{ left: 0, right: 0, top: 2, bottom: 0 }}>
            <XAxis dataKey="cycle" tick={{ fill: "var(--ink3)", fontSize: 9 }} axisLine={false} tickLine={false} />
            <Line type="monotone" dataKey="val" stroke={parentCategory.color || "var(--terra)"} strokeWidth={2} />
            <Tooltip labelFormatter={(_, payload) => payload[0]?.payload?.fullLabel} formatter={(v) => fmtShort(Number(v), shortCurrency)} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 8, fontSize: 11 }} cursor={{ fill: "var(--stone1)" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
