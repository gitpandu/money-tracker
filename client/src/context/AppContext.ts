import { createContext } from 'react';

export interface AppContextType {
  loading: boolean;
  error: string | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (message: string | null) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);
