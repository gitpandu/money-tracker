import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Transaction, ReceiptData } from '../types';

export function useTransactions(cycleId?: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [cycleId]);
  async function loadTransactions() {
    setLoading(true);
    try {
      const data = await api.getTransactions(cycleId);
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function create(tx: any, receipt?: ReceiptData | null) {
    const newTx = await api.createTransaction(tx, receipt);
    setTransactions(prev => [newTx, ...prev].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id));
    return newTx;
  }

  async function update(id: number, tx: any, receipt?: ReceiptData | null, removeReceipt?: boolean) {
    const updatedTx = await api.updateTransaction(id, tx, receipt, removeReceipt);
    setTransactions(prev => prev.map(t => t.id === id ? updatedTx : t).sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id));
    return updatedTx;
  }

  async function remove(id: number) {
    await api.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => t.id !== id));
  }

  return { transactions, loading, create, update, remove, refresh: loadTransactions };
}
