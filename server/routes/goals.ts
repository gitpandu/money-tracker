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
  const { name, icon, target, deadline, color } = req.body;
  if (!name || target === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    db.prepare('UPDATE goals SET name = ?, icon = ?, target = ?, deadline = ?, color = ? WHERE id = ?')
      .run(name, icon, target, deadline || null, color, id);
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
    db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// --- Contributions ---

goalsRouter.get('/:id/contributions', (req, res) => {
  const { id } = req.params;
  try {
    const contribs = db.prepare(
      'SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY date DESC, created_at DESC'
    ).all(id);
    res.json(contribs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

goalsRouter.post('/:id/contributions', (req, res) => {
  const { id } = req.params;
  const { amount, note, date } = req.body;
  if (amount === undefined || amount === 0) {
    return res.status(400).json({ error: 'amount is required and cannot be zero' });
  }

  try {
    const goal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as { id: number; saved: number; target: number } | undefined;
    if (!goal) return res.status(404).json({ error: 'Goal not found' });

    const newSaved = goal.saved + Number(amount);

    const insert = db.prepare(
      'INSERT INTO goal_contributions (goal_id, amount, note, date) VALUES (?, ?, ?, ?)'
    );
    const info = insert.run(id, Number(amount), note || '', date || new Date().toISOString().slice(0, 10));

    db.prepare('UPDATE goals SET saved = ? WHERE id = ?').run(newSaved, id);

    const contrib = db.prepare('SELECT * FROM goal_contributions WHERE id = ?').get(info.lastInsertRowid);
    const updatedGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);

    res.status(201).json({ contribution: contrib, goal: updatedGoal });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

goalsRouter.delete('/:id/contributions/:cid', (req, res) => {
  const { id, cid } = req.params;
  try {
    const contrib = db.prepare('SELECT * FROM goal_contributions WHERE id = ? AND goal_id = ?').get(cid, id) as { amount: number } | undefined;
    if (!contrib) return res.status(404).json({ error: 'Contribution not found' });

    db.prepare('DELETE FROM goal_contributions WHERE id = ?').run(cid);
    db.prepare('UPDATE goals SET saved = saved - ? WHERE id = ?').run(contrib.amount, id);

    const updatedGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    res.json({ success: true, goal: updatedGoal });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
