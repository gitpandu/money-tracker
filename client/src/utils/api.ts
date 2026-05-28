import { Category, Transaction, Budget, BudgetCycle, Goal, ReceiptData } from '../types';

const API = '/api';

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API}/categories`);
    return res.json();
  },
  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.json();
  },
  async updateCategory(id: number, cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
    return res.json();
  },
  async deleteCategory(id: number): Promise<void> {
    await fetch(`${API}/categories/${id}`, { method: 'DELETE' });
  },

  // Transactions
  async getTransactions(cycleId?: string): Promise<Transaction[]> {
    const url = cycleId ? `${API}/transactions?cycleId=${cycleId}` : `${API}/transactions`;
    const res = await fetch(url);
    return res.json();
  },
  async createTransaction(tx: any, receipt?: ReceiptData | null): Promise<Transaction> {
    const formData = new FormData();
    Object.keys(tx).forEach(key => formData.append(key, tx[key]));
    if (receipt?.file) formData.append('receipt', receipt.file);

    const res = await fetch(`${API}/transactions`, { method: 'POST', body: formData });
    return res.json();
  },
  async updateTransaction(id: number, tx: any, receipt?: ReceiptData | null, removeReceipt?: boolean): Promise<Transaction> {
    const formData = new FormData();
    Object.keys(tx).forEach(key => formData.append(key, tx[key]));
    if (receipt?.file) formData.append('receipt', receipt.file);
    if (removeReceipt) formData.append('remove_receipt', 'true');

    const res = await fetch(`${API}/transactions/${id}`, { method: 'PUT', body: formData });
    return res.json();
  },
  async deleteTransaction(id: number): Promise<void> {
    await fetch(`${API}/transactions/${id}`, { method: 'DELETE' });
  },

  // Budgets
  async getBudgets(cycleId?: string): Promise<Budget[]> {
    const url = cycleId ? `${API}/budgets?cycleId=${cycleId}` : `${API}/budgets`;
    const res = await fetch(url);
    return res.json();
  },
  async createBudget(budget: Partial<Budget>): Promise<Budget> {
    const res = await fetch(`${API}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    return res.json();
  },
  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget> {
    const res = await fetch(`${API}/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
    return res.json();
  },
  async deleteBudget(id: number): Promise<void> {
    await fetch(`${API}/budgets/${id}`, { method: 'DELETE' });
  },

  // Cycles
  async getCycles(): Promise<BudgetCycle[]> {
    const res = await fetch(`${API}/cycles`);
    return res.json();
  },
  async createCycle(cycle: Partial<BudgetCycle>): Promise<BudgetCycle> {
    const res = await fetch(`${API}/cycles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cycle),
    });
    return res.json();
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    const res = await fetch(`${API}/goals`);
    return res.json();
  },
  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API}/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return res.json();
  },
  async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`${API}/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    return res.json();
  },
  async deleteGoal(id: number): Promise<void> {
    await fetch(`${API}/goals/${id}`, { method: 'DELETE' });
  },

  // Reports
  async getReportSummary(cycleId: string): Promise<{ income: number, expense: number, net: number }> {
    const res = await fetch(`${API}/reports/summary?cycleId=${cycleId}`);
    return res.json();
  },
  async getReportTrend(): Promise<Array<{ cycle: string, income: number, expense: number }>> {
    const res = await fetch(`${API}/reports/trend`);
    return res.json();
  }
};
