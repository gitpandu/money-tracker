import express from 'express';
import cors from 'cors';
import { join } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';

import { runMigrations } from './db/database.js';
import { categoriesRouter } from './routes/categories.js';
import { cyclesRouter } from './routes/cycles.js';
import { goalsRouter } from './routes/goals.js';
import { transactionsRouter } from './routes/transactions.js';
import { budgetsRouter } from './routes/budgets.js';
import { reportsRouter } from './routes/reports.js';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadsDir = join('data', 'receipts');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded receipts statically
app.use('/receipts', express.static(uploadsDir));

// API Routes
app.use('/api/categories', categoriesRouter);
app.use('/api/cycles', cyclesRouter);
app.use('/api/goals', goalsRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/reports', reportsRouter);

// Serve frontend in production
const publicDir = join('server', 'public');
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (_req, res) => {
    res.sendFile(join(publicDir, 'index.html'));
  });
}

// Start server
runMigrations();
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
