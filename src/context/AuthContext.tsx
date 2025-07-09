import { ReactNode, useState, useEffect } from 'react';
import { AuthContext, User, AuthContextType } from './authUtils';
import { TokenManager } from './tokenManager';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUserData = localStorage.getItem('user_data');
      if (storedUserData) {
        return JSON.parse(storedUserData) as User;
      }
    } catch (e) {
      console.error("Failed to parse user data from localStorage:", e);
      TokenManager.clearAllAuthData();
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  // Helper function to clear all authentication data
  const clearAuthData = () => {
    TokenManager.clearAllAuthData();
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = TokenManager.getToken();
      const storedUser = localStorage.getItem('user_data');
      
      // If no token or user data, ensure clean state
      if (!token || !storedUser) {
        clearAuthData();
        setLoading(false);
        return;
      }

      // Validate token with backend
      const isValidToken = await TokenManager.validateToken(token);
      
      if (!isValidToken) {
        // Token is invalid, clear all auth data
        console.log('Invalid token detected, clearing authentication data');
        clearAuthData();
      } else {
        // Token is valid, set authenticated state
        setIsAuthenticated(!!user && !!token);
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, [user]);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearAuthData();
  };

  const register = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('role', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
  };

  // Check for authentication periodically (every 5 minutes)
  useEffect(() => {
    const interval = setInterval(async () => {
      const token = TokenManager.getToken();
      if (token && isAuthenticated) {
        const isValid = await TokenManager.validateToken(token);
        if (!isValid) {
          console.log('Token expired or invalid, logging out user');
          clearAuthData();
        }
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const contextValue: AuthContextType = {
    isAuthenticated,
    user,
    login,
    logout,
    register,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}