import { Transaction, Category } from '../types';
import { Strings } from '../utils/i18n';
import { fmtShort } from '../utils/currency';
import { TransactionList } from '../components/TransactionList';

interface Props {
  txns: Transaction[];
  categories: Category[];
  t: Strings;
  shortCurrency: boolean;
  onSaveTxn: (tx: Partial<Transaction>, receipt?: any, removeReceipt?: boolean) => void;
  onDeleteTxn: (id: number) => void;
}

export function DashboardPage({ txns, categories, t, shortCurrency, onSaveTxn, onDeleteTxn }: Props) {
  const income = txns.filter(x => x.type === "income").reduce((s, x) => s + x.amount, 0);
  const expense = txns.filter(x => x.type === "expense").reduce((s, x) => s + x.amount, 0);
  const net = income - expense;

  return (
    <div>
      <div className="hero">
        <div className="hero-row">
          <div><div className="sum-label">{t.income}</div><div className="sum-amt inc">{fmtShort(income, shortCurrency)}</div></div>
          <div><div className="sum-label">{t.expense}</div><div className="sum-amt exp">{fmtShort(expense, shortCurrency)}</div></div>
        </div>
        <div className="hero-net">
          <span className="hero-net-label">{t.netBalance}</span>
          <span className="hero-net-amt" style={{ color: net >= 0 ? "var(--income)" : "var(--expense)" }}>
            {net >= 0 ? "+" : "−"}{fmtShort(Math.abs(net), shortCurrency)}
          </span>
        </div>
      </div>
      <p className="section-lbl">{t.transactions}</p>
      <TransactionList
        txns={txns}
        categories={categories}
        t={t}
        shortCurrency={shortCurrency}
        onSave={onSaveTxn}
        onDelete={onDeleteTxn}
      />
    </div>
  );
}
