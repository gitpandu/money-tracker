import { Router } from 'express';
import { db } from '../db/database.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', (_req, res) => {
  try {
    const cats = db.prepare('SELECT * FROM categories').all();
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

categoriesRouter.post('/', (req, res) => {
  const { name, type, parent_id, color, icon } = req.body;
  if (!name || !type || !color) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO categories (name, type, parent_id, color, icon) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(name, type, parent_id || null, color, icon || null);
    
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(cat);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

categoriesRouter.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, type, parent_id, color, icon } = req.body;
  if (!name || !type || !color) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const stmt = db.prepare('UPDATE categories SET name = ?, type = ?, parent_id = ?, color = ?, icon = ? WHERE id = ?');
    stmt.run(name, type, parent_id || null, color, icon || null, id);
    
    const cat = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

categoriesRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  try {
    // ON DELETE CASCADE will handle sub-categories
    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    stmt.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
