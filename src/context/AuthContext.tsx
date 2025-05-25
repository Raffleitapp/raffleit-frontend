import { ReactNode, useState } from 'react';
import { AuthContext } from './authUtils';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  );
  const [user, setUser] = useState<{ role: 'user' | 'host' | 'admin' | null }>({
    role: localStorage.getItem('role') as 'user' | 'host' | 'admin' | null,
  });

  const login = (role: 'user' | 'host' | 'admin') => {
    setIsAuthenticated(true);
    setUser({ role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUser({ role: null });
  };

  const register = (role: 'user' | 'host' | 'admin') => {
    // Example: set token and role in localStorage, then authenticate
    localStorage.setItem('token', 'dummy-token');
    localStorage.setItem('role', role);
    setIsAuthenticated(true);
    setUser({ role });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}