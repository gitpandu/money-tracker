export interface Category {
  id: number;
  name: string;
  type: 'income' | 'expense';
  parent_id: number | null;
  color: string;
  icon: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  amount: number;
  type: 'income' | 'expense';
  category_id: number;
  note: string;
  date: string;
  receipt_path: string | null;
  created_at: string;
}

export interface Budget {
  id: number;
  cycle_id: number;
  category_id: number;
  limit_amount: number;
  active: number;
  note: string;
  created_at: string;
}

export interface BudgetCycle {
  id: number;
  label: string;
  start_date: string;
  end_date: string;
}

export interface Goal {
  id: number;
  name: string;
  icon: string;
  target: number;
  saved: number;
  deadline: string | null;
  color: string;
  created_at: string;
}
