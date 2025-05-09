import { createContext, useContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: { role: 'host' | 'admin' | null };
  login: (role: 'host' | 'admin') => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}