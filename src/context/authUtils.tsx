import { createContext, useContext } from 'react';

export interface User {
  user_id: string | number;
  first_name?: string;
  last_name?: string;
  email: string;
  role: 'user' | 'host' | 'admin';
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  register: (token: string, userData: User) => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}