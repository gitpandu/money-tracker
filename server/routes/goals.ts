import { Router } from 'express';
import { db } from '../db/database.js';

export const goalsRouter = Router();

goalsRouter.get('/', (_req, res) => {
  try {
    const goals = db.prepare('SELECT * FROM goals').all();
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

goalsRouter.post('/', (req, res) => {
  const { name, icon, target, saved, deadline, color } = req.body;
  if (!name || target === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare('INSERT INTO goals (name, icon, target, saved, deadline, color) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(name, icon || '🎯', target, saved || 0, deadline || null, color || '#4a7fc4');
    
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

goalsRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, icon, target, saved, deadline, color } = req.body;
  if (!name || target === undefined || saved === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare('UPDATE goals SET name = ?, icon = ?, target = ?, saved = ?, deadline = ?, color = ? WHERE id = ?');
    stmt.run(name, icon, target, saved, deadline || null, color, id);
    
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    if (!goal) return res.status(404).json({ error: 'Not found' });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

goalsRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const stmt = db.prepare('DELETE FROM goals WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
