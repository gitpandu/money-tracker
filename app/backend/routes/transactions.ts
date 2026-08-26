import { Router } from 'express';
import multer from 'multer';
import { db } from '../db/database.js';
import { join } from 'node:path';
import { unlink } from 'node:fs/promises';

export const transactionsRouter = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'data/receipts');
  },
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}.${ext}`);
  }
});
const upload = multer({ storage });

transactionsRouter.get('/', (req, res) => {
  const cycleId = req.query.cycleId as string | undefined;
  try {
    let txns;
    if (cycleId) {
      const cycle = db.prepare('SELECT * FROM budget_cycles WHERE id = ?').get(cycleId) as any;
      if (!cycle) return res.status(404).json({ error: 'Cycle not found' });
      txns = db.prepare('SELECT * FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC, id DESC').all(cycle.start_date, cycle.end_date);
    } else {
      txns = db.prepare('SELECT * FROM transactions ORDER BY date DESC, id DESC').all();
    }
    res.json(txns);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

transactionsRouter.post('/', upload.single('receipt'), (req, res) => {
  const { amount, type, category_id, note, date } = req.body;
  if (!amount || !type || !category_id || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const receipt_path = req.file ? `receipts/${req.file.filename}` : null;

  try {
    const stmt = db.prepare('INSERT INTO transactions (amount, type, category_id, note, date, receipt_path) VALUES (?, ?, ?, ?, ?, ?)');
    const info = stmt.run(parseInt(amount), type, parseInt(category_id), note || '', date, receipt_path);

    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json(txn);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

transactionsRouter.put('/:id', upload.single('receipt'), async (req, res) => {
  const id = req.params.id as string;
  const { amount, type, category_id, note, date, remove_receipt } = req.body;

  if (!amount || !type || !category_id || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Not found' });

    let receipt_path = existing.receipt_path;

    if (req.file) {
      receipt_path = `receipts/${req.file.filename}`;
      if (existing.receipt_path) {
        await unlink(join('data', existing.receipt_path)).catch(() => { });
      }
    } else if (remove_receipt === 'true' && existing.receipt_path) {
      receipt_path = null;
      await unlink(join('data', existing.receipt_path)).catch(() => { });
    }

    const stmt = db.prepare('UPDATE transactions SET amount = ?, type = ?, category_id = ?, note = ?, date = ?, receipt_path = ? WHERE id = ?');
    stmt.run(parseInt(amount), type, parseInt(category_id), note || '', date, receipt_path, id);

    const txn = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
    res.json(txn);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

transactionsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id as string;
  try {
    const existing = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const stmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    stmt.run(id);

    if (existing.receipt_path) {
      await unlink(join('data', existing.receipt_path)).catch(() => { });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});
