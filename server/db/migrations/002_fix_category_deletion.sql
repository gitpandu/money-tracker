-- Update transactions table to set category_id to NULL when a category is deleted
CREATE TABLE transactions_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  note TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  receipt_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO transactions_new (id, amount, type, category_id, note, date, receipt_path, created_at)
SELECT id, amount, type, category_id, note, date, receipt_path, created_at FROM transactions;

DROP TABLE transactions;
ALTER TABLE transactions_new RENAME TO transactions;
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category ON transactions(category_id);

-- Update budgets table to cascade delete when a category is deleted
CREATE TABLE budgets_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cycle_id INTEGER NOT NULL REFERENCES budget_cycles(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  limit_amount INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO budgets_new (id, cycle_id, category_id, limit_amount, active, note, created_at)
SELECT id, cycle_id, category_id, limit_amount, active, note, created_at FROM budgets;

DROP TABLE budgets;
ALTER TABLE budgets_new RENAME TO budgets;
CREATE INDEX idx_budgets_cycle ON budgets(cycle_id);
CREATE INDEX idx_budgets_category ON budgets(category_id);
