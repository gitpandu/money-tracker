import { Router } from 'express';
import { db } from '../db/database.js';

export const reportsRouter = Router();

reportsRouter.get('/summary', (req, res) => {
  const cycleId = req.query.cycleId as string | undefined;
  if (!cycleId) return res.status(400).json({ error: 'Missing cycleId' });

  try {
    const cycle = db.prepare('SELECT * FROM budget_cycles WHERE id = ?').get(cycleId) as any;
    if (!cycle) return res.status(404).json({ error: 'Cycle not found' });

    const txns = db.prepare('SELECT amount, type FROM transactions WHERE date >= ? AND date <= ?').all(cycle.start_date, cycle.end_date) as any;

    let income = 0;
    let expense = 0;
    for (const t of txns) {
      if (t.type === 'income') income += t.amount;
      if (t.type === 'expense') expense += t.amount;
    }

    res.json({ income, expense, net: income - expense });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

reportsRouter.get('/trend', (_req, res) => {
  try {
    const cycles = db.prepare('SELECT * FROM budget_cycles ORDER BY start_date ASC').all() as any;
    const result = [];

    for (const cycle of cycles) {
      const txns = db.prepare('SELECT amount, type FROM transactions WHERE date >= ? AND date <= ?').all(cycle.start_date, cycle.end_date) as any;
      let income = 0;
      let expense = 0;
      for (const t of txns) {
        if (t.type === 'income') income += t.amount;
        if (t.type === 'expense') expense += t.amount;
      }
      result.push({ 
        cycle: cycle.label, 
        start_date: cycle.start_date,
        end_date: cycle.end_date,
        income, 
        expense 
      });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
