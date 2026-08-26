import { Router } from 'express';
import { db } from '../db/database.js';

export const cyclesRouter = Router();

cyclesRouter.get('/', (_req, res) => {
  try {
    const cycles = db.prepare('SELECT * FROM budget_cycles ORDER BY start_date DESC').all();
    res.json(cycles);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

cyclesRouter.post('/', (req, res) => {
  const { label, start_date, end_date } = req.body;
  if (!label || !start_date || !end_date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const previousCycle = db.prepare(
      'SELECT * FROM budget_cycles WHERE start_date < ? ORDER BY start_date DESC LIMIT 1'
    ).get(start_date) as any;

    db.exec('BEGIN');

    const stmt = db.prepare('INSERT INTO budget_cycles (label, start_date, end_date) VALUES (?, ?, ?)');
    const info = stmt.run(label, start_date, end_date);

    if (previousCycle) {
      db.prepare(`
        INSERT INTO budgets (cycle_id, category_id, limit_amount, active, note)
        SELECT ?, category_id, limit_amount, active, note
        FROM budgets
        WHERE cycle_id = ?
      `).run(info.lastInsertRowid, previousCycle.id);
    }

    if (previousCycle) {
      const totals = db.prepare(`
        SELECT
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS income,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS expense
        FROM transactions
        WHERE date >= ? AND date <= ?
      `).get(previousCycle.start_date, previousCycle.end_date) as { income: number; expense: number };
      const remaining = totals.income - totals.expense;

      if (remaining > 0) {
        let category = db.prepare(
          "SELECT id FROM categories WHERE type = 'income' AND name = ? LIMIT 1"
        ).get('Carry Over') as { id: number } | undefined;

        if (!category) {
          const categoryInfo = db.prepare(
            "INSERT INTO categories (name, type, color, icon) VALUES (?, 'income', ?, ?)"
          ).run('Carry Over', '#4a7fc4', 'carry');
          category = { id: Number(categoryInfo.lastInsertRowid) };
        }

        db.prepare(`
          INSERT INTO transactions (amount, type, category_id, note, date)
          VALUES (?, 'income', ?, ?, ?)
        `).run(remaining, category.id, 'Carry over balance', start_date);
      }
    }

    const cycle = db.prepare('SELECT * FROM budget_cycles WHERE id = ?').get(info.lastInsertRowid);
    db.exec('COMMIT');
    res.status(201).json(cycle);
  } catch (err) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // No active transaction.
    }
    res.status(500).json({ error: String(err) });
  }
});
