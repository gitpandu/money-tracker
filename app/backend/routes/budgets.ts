import { Router } from 'express';
import { db } from '../db/database.js';

export const budgetsRouter = Router();

budgetsRouter.get('/', (req, res) => {
  const cycleId = req.query.cycleId as string | undefined;
  try {
    let budgets;
    if (cycleId) {
      budgets = db.prepare('SELECT * FROM budgets WHERE cycle_id = ?').all(cycleId);
    } else {
      budgets = db.prepare('SELECT * FROM budgets').all();
    }
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

budgetsRouter.post('/', (req, res) => {
  const { cycle_id, category_id, limit_amount, active, note } = req.body;
  if (!cycle_id || !category_id || limit_amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare('INSERT INTO budgets (cycle_id, category_id, limit_amount, active, note) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(cycle_id, category_id, limit_amount, active === undefined ? 1 : active, note || '');
    
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

budgetsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const { cycle_id, category_id, limit_amount, active, note } = req.body;
  if (!cycle_id || !category_id || limit_amount === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare('UPDATE budgets SET cycle_id = ?, category_id = ?, limit_amount = ?, active = ?, note = ? WHERE id = ?');
    stmt.run(cycle_id, category_id, limit_amount, active, note || '', id);
    
    const budget = db.prepare('SELECT * FROM budgets WHERE id = ?').get(id);
    if (!budget) return res.status(404).json({ error: 'Not found' });
    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

budgetsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM budgets WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
