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
    const stmt = db.prepare('INSERT INTO budget_cycles (label, start_date, end_date) VALUES (?, ?, ?)');
    const info = stmt.run(label, start_date, end_date);
    
    const cycle = db.prepare('SELECT * FROM budget_cycles WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(cycle);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
