import { ReactNode, useState, useEffect } from 'react';
import { AuthContext, User, AuthContextType } from './authUtils';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        return JSON.parse(storedUserData) as User;
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage:", e);
      localStorage.removeItem('user_data');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('token')
  );

  useEffect(() => {
    setIsAuthenticated(!!user && !!localStorage.getItem('token'));
  }, [user]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user_data');
    setIsAuthenticated(false);
    setUser(null);
  };

  const register = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}