import { createContext, useContext } from 'react';

export interface AuthContextType {
  isAuthenticated: boolean;
  user: { role: 'user' | 'host' | 'admin' | null };
  login: (role: 'user' | 'host' | 'admin') => void;
  logout: () => void;
  register: (role: 'user' | 'host' | 'admin') => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}