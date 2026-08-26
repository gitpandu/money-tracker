import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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

  return { categories, save, remove, refresh: loadCategories };
}
