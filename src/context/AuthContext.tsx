import { ReactNode, useState } from 'react';
import { AuthContext } from './authUtils';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  );
  const [user, setUser] = useState<{ role: 'host' | 'admin' | null }>({
    role: localStorage.getItem('role') as 'host' | 'admin' | null,
  });

  const login = (role: 'host' | 'admin') => {
    setIsAuthenticated(true);
    setUser({ role });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUser({ role: null });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}