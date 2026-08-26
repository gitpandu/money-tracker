import React, { useState, useCallback } from 'react';
import { AppContext } from './AppContext';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const [error, setErrorState] = useState<string | null>(null);

  const startLoading = useCallback(() => setLoadingCount(prev => prev + 1), []);
  const stopLoading = useCallback(() => setLoadingCount(prev => Math.max(0, prev - 1)), []);
  const setError = useCallback((message: string | null) => setErrorState(message), []);

  const loading = loadingCount > 0;

  return (
    <AppContext.Provider value={{ loading, error, startLoading, stopLoading, setError }}>
      {children}
    </AppContext.Provider>
  );
}
