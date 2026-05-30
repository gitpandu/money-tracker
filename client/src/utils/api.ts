import { Category, Transaction, Budget, BudgetCycle, Goal, ReceiptData } from '../types';

const API = '/api';

type ApiHandlers = {
  onStart: () => void;
  onEnd: () => void;
  onError: (msg: string) => void;
};

let handlers: ApiHandlers = {
  onStart: () => {},
  onEnd: () => {},
  onError: () => {}
};

export const setApiHandlers = (h: Partial<ApiHandlers>) => {
  handlers = { ...handlers, ...h };
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  handlers.onStart();
  try {
    const res = await fetch(`${API}${path}`, options);
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    // Handle 204 No Content
    if (res.status === 204) return {} as T;
    return await res.json();
  } catch (err: any) {
    const msg = err.message || 'An unexpected error occurred';
    handlers.onError(msg);
    throw err;
  } finally {
    handlers.onEnd();
  }
}

export const api = {
  // Categories
  async getCategories(): Promise<Category[]> {
    return request<Category[]>('/categories');
  },
  async createCategory(cat: Partial<Category>): Promise<Category> {
    return request<Category>('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
  },
  async updateCategory(id: number, cat: Partial<Category>): Promise<Category> {
    return request<Category>(`/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cat),
    });
  },
  async deleteCategory(id: number): Promise<void> {
    await request<void>(`/categories/${id}`, { method: 'DELETE' });
  },

  // Transactions
  async getTransactions(cycleId?: string): Promise<Transaction[]> {
    const url = cycleId ? `/transactions?cycleId=${cycleId}` : '/transactions';
    return request<Transaction[]>(url);
  },
  async createTransaction(tx: any, receipt?: ReceiptData | null): Promise<Transaction> {
    const formData = new FormData();
    Object.keys(tx).forEach(key => formData.append(key, tx[key]));
    if (receipt?.file) formData.append('receipt', receipt.file);

    return request<Transaction>('/transactions', { method: 'POST', body: formData });
  },
  async updateTransaction(id: number, tx: any, receipt?: ReceiptData | null, removeReceipt?: boolean): Promise<Transaction> {
    const formData = new FormData();
    Object.keys(tx).forEach(key => formData.append(key, tx[key]));
    if (receipt?.file) formData.append('receipt', receipt.file);
    if (removeReceipt) formData.append('remove_receipt', 'true');

    return request<Transaction>(`/transactions/${id}`, { method: 'PUT', body: formData });
  },
  async deleteTransaction(id: number): Promise<void> {
    await request<void>(`/transactions/${id}`, { method: 'DELETE' });
  },

  // Budgets
  async getBudgets(cycleId?: string): Promise<Budget[]> {
    const url = cycleId ? `/budgets?cycleId=${cycleId}` : '/budgets';
    return request<Budget[]>(url);
  },
  async createBudget(budget: Partial<Budget>): Promise<Budget> {
    return request<Budget>('/budgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
  },
  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget> {
    return request<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(budget),
    });
  },
  async deleteBudget(id: number): Promise<void> {
    await request<void>(`/budgets/${id}`, { method: 'DELETE' });
  },

  // Cycles
  async getCycles(): Promise<BudgetCycle[]> {
    return request<BudgetCycle[]>('/cycles');
  },
  async createCycle(cycle: Partial<BudgetCycle>): Promise<BudgetCycle> {
    return request<BudgetCycle>('/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cycle),
    });
  },

  // Goals
  async getGoals(): Promise<Goal[]> {
    return request<Goal[]>('/goals');
  },
  async createGoal(goal: Partial<Goal>): Promise<Goal> {
    return request<Goal>('/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
  },
  async updateGoal(id: number, goal: Partial<Goal>): Promise<Goal> {
    return request<Goal>(`/goals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
  },
  async deleteGoal(id: number): Promise<void> {
    await request<void>(`/goals/${id}`, { method: 'DELETE' });
  },

  // Reports
  async getReportSummary(cycleId: string): Promise<{ income: number, expense: number, net: number }> {
    return request<{ income: number, expense: number, net: number }>(`/reports/summary?cycleId=${cycleId}`);
  },
  async getReportTrend(): Promise<Array<{ cycle: string, income: number, expense: number }>> {
    return request<Array<{ cycle: string, income: number, expense: number }>>('/reports/trend');
  }
};
