import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function save(cat: Partial<Category>) {
    if (cat.id) {
      const updated = await api.updateCategory(cat.id, cat);
      setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
      return updated;
    } else {
      const created = await api.createCategory(cat);
      setCategories(prev => [...prev, created]);
      return created;
    }
  }

  async function remove(id: number) {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id && c.parent_id !== id));
  }

  return { categories, loading, save, remove, refresh: loadCategories };
}
