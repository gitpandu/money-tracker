import { useMemo, useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Transaction, Category, BudgetCycle } from '../types';
import { Strings } from '../utils/i18n';
import { fmt, fmtShort } from '../utils/currency';
import { api } from '../utils/api';
import { txnsInCycle } from '../utils/dates';

const PIE_COLORS = ["#e85d3a", "#2eaa72", "#6b5fc7", "#e8b84b", "#4a7fc4", "#d45a8a"];

interface Props {
  allTxns: Transaction[];
  categories: Category[];
  activeCycle?: BudgetCycle;
  t: Strings;
  shortCurrency: boolean;
}

export function ReportsPage({ allTxns, categories, activeCycle, t, shortCurrency }: Props) {
  const [trendData, setTrendData] = useState<Array<{ cycle: string, income: number, expense: number }>>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });

  useEffect(() => {
    api.getReportTrend().then(setTrendData);
    if (activeCycle) {
      api.getReportSummary(activeCycle.id.toString()).then(setSummary);
    }
  }, [activeCycle]);

  const txns = txnsInCycle(allTxns, activeCycle);
  const savings = summary.income > 0 ? (((summary.income - summary.expense) / summary.income) * 100).toFixed(0) : 0;

  const pieData = useMemo(() => {
    const map: Record<string, number> = {};
    const getCat = (id: number) => categories.find(c => c.id === id);
    txns.filter(x => x.type === "expense").forEach(x => {
      const cat = getCat(x.category_id);
      const par = cat ? (cat.parent_id ? getCat(cat.parent_id) : cat) : null;
      const name = par ? par.name : t.uncategorized;
      map[name] = (map[name] || 0) + x.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [txns, categories]);

  const topCat = [...pieData].sort((a, b) => b.value - a.value)[0]?.name || "—";
  const avgExp = trendData.length > 0 ? Math.round(trendData.reduce((s, m) => s + m.expense, 0) / trendData.length) : 0;

  return (
    <div>
      <div className="stats-grid">
        <div className="stat-box"><div className="stat-val" style={{ color: "var(--income)" }}>{savings}%</div><div className="stat-lbl">{t.savings}</div></div>
        <div className="stat-box"><div className="stat-val" style={{ fontSize: 12, lineHeight: 1.3 }}>{topCat}</div><div className="stat-lbl">{t.topSpend}</div></div>
        <div className="stat-box"><div className="stat-val">{fmtShort(avgExp, shortCurrency)}</div><div className="stat-lbl">{t.avgCycle}</div></div>
      </div>

      <div className="chart-card">
        <div className="chart-title">{t.monthlyOverview}</div>
        <ResponsiveContainer width="100%" height={175}>
          <BarChart data={trendData} barGap={3} margin={{ left: -16 }}>
            <XAxis dataKey="cycle" tick={{ fill: "var(--ink3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v: number) => `${(v / 1e6).toFixed(0)}jt`} tick={{ fill: "var(--ink3)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 10, fontSize: 12, color: "var(--ink)" }} />
            <Bar dataKey="income" fill="var(--income)" radius={[4, 4, 0, 0]} name={t.income} />
            <Bar dataKey="expense" fill="var(--expense)" radius={[4, 4, 0, 0]} name={t.expense} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <div className="chart-title">{t.expenseByCategory}</div>
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={72} dataKey="value"
              label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
              labelLine={false} style={{ fontSize: 10 }}>
              {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Pie>
            <Tooltip formatter={(v) => fmt(Number(v))} contentStyle={{ background: "var(--paper)", border: "1px solid var(--stone1)", borderRadius: 10, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
